import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AlertController, Events } from 'ionic-angular';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { AngularFireDatabase } from 'angularfire2/database';
import { Subject } from 'rxjs/Subject';
import { switchMap } from 'rxjs/operators';

/**
 * Generated class for the BluetoothPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

let connectedBTName: string;
let lastData: string;
let initialList = [12, 13, 14, 0, 0, 0, 0, 0, 0];

@Component({
  selector: 'page-bluetooth',
  templateUrl: 'bluetooth.html',
})
export class BluetoothPage {

  cardId$: Subject<string>;
  userUid$: Subject<string>;
  itemID$: Subject<string>;
  UidFromId$: Subject<string>;
  queriedName: string;
  unpairedDevices: any;
  pairedDevices: any;
  gettingDevices: Boolean;
  connectStatus: Boolean;
  rxData: string;
  typedEmail: string;
  retriviedUid: string;
  userUid: string;
  produtoId: any;
  prodList: any[];
  index: number;
  userSaldo: number;
  itemPreco: number;
  itemId: number;
  itemNome: string;
  responseReady: Boolean;

  dataReceived: {
    productID: any,
    cardID: any
  }

  constructor(private bluetoothSerial: BluetoothSerial,
    private alertCtrl: AlertController,
    private myServices: MyServicesProvider,
    private events: Events,
    private afDatabase: AngularFireDatabase) {
    bluetoothSerial.enable();
    this.events.subscribe('BT:BluetoothData', rxData => {
      this.rxData = rxData;
    });

    this.dataReceived = {
      productID: '',
      cardID: ''
    }

    this.index = 0;
    this.responseReady = false;

    if (!this.prodList)
      this.prodList = initialList;

    this.cardId$ = new Subject<string>();
    this.userUid$ = new Subject<string>();
    this.itemID$ = new Subject<string>();
    this.UidFromId$ = new Subject<string>();
  }

  ionViewWillEnter() {
    this.bluetoothSerial.isConnected().then(res => {
      this.connectStatus = true;
      this.rxData = lastData;
      connectedBTName = connectedBTName;
    }).catch(error => {
      this.connectStatus = false;
      connectedBTName = '';
    });
    this.locateUserCardID();
    this.getUserUidByEmail();
    this.getItemById();
    this.getUidFromCardId();
  }

  startScanning() {
    this.pairedDevices = null;
    this.unpairedDevices = null;
    this.gettingDevices = true;
    this.bluetoothSerial.discoverUnpaired().then((success) => {
      this.unpairedDevices = success;
      this.gettingDevices = false;
      success.forEach(element => {
      });
    },
      (err) => {
      })

    this.bluetoothSerial.list().then((success) => {
      this.pairedDevices = success;
    },
      (err) => {
      })
  }

  selectDevice(address: any, name: any) {
    if (this.bluetoothSerial.isEnabled()) {
      let alert = this.alertCtrl.create({
        title: 'Conectar',
        message: 'Você deseja se Conectar com (' + name + ')?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Conectar',
            handler: () => {
              this.myServices.showLoading();
              this.bluetoothSerial.connect(address).subscribe(res => {
                let toast = this.myServices.criarToast('Conectado com ' + name + '.');
                toast.present();
                connectedBTName = name;
                this.connectStatus = true;
                this.readBluetoothData();
                this.myServices.dismissLoading();
              }, error => {
                let toast = this.myServices.criarToast('Erro ao se conectar com ' + name + '.');
                toast.present();
                this.myServices.dismissLoading();
              })
            }
          }
        ]
      });
      alert.present();
    } else {
      let toast = this.myServices.criarToast('Ative o Bluetooth.');
      toast.present();
    }
  }

  disconnect() {
    if (this.connectStatus) {
      let alert = this.alertCtrl.create({
        title: 'Desconectar?',
        message: 'Você deseja Desconectar do dispositivo (' + connectedBTName + ')?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Desconectar',
            handler: () => {
              this.bluetoothSerial.disconnect();
              this.connectStatus = false;
            }
          }
        ]
      });
      alert.present();
    } else {
      let toast = this.myServices.criarToast('Nenhum dispositivo Bluetooth conectado.');
      toast.present();
    }
  }

  readBluetoothData() {
    this.bluetoothSerial.subscribeRawData().subscribe(res => {
      this.bluetoothSerial.readUntil('\n').then(data => {
        if (data != "" && data.length > 4) {
          this.rxData = data;
          lastData = this.rxData;

          this.dataReceived["productID"] = this.rxData.split(', ')[0];
          let cardIdStr = this.rxData.split(', ')[1];;
          this.dataReceived["cardID"] = cardIdStr.replace(/(\r\n|\n|)/gm, '');

          if (this.dataReceived) {
            this.checkProduct(this.dataReceived.productID);
            this.cardId$.next(this.dataReceived.cardID);
            this.UidFromId$.next(this.dataReceived.cardID);
            setTimeout(() => {
              this.sendResponse();
            }, 1000);
          }
        }
        else if (data != "" && data == "Ok\n") {
          this.registerBuy(this.itemNome, this.itemId, this.itemPreco);
        }
      }).catch(error => {
        let toast = this.myServices.criarToast('Error ao receber dados do dispositivo Bluetooth (' + connectedBTName + ').');
        toast.present();
      });
    }, error => {
      let toast = this.myServices.criarToast('Conexão perdida com dispositivo Bluetooth (' + connectedBTName + ').');
      toast.present();
    })
  }

  cardRegister() {
    if (this.typedEmail && this.dataReceived) {
      this.userUid$.next(this.typedEmail);
    } else if (!this.typedEmail) {
      let toast = this.myServices.criarToast('Campo email vazio.');
      toast.present();
    } else if (!this.dataReceived) {
      let toast = this.myServices.criarToast('Nenhum ID lido.');
      toast.present();
    }
  }

  getUserUidByEmail() {
    const queryObservableEmail = this.userUid$.pipe(
      switchMap(email => {
        return this.afDatabase.list('/users', ref => ref.orderByChild('email').equalTo(email).limitToFirst(1)).snapshotChanges();
      })
    );
    //subscribe to changes
    queryObservableEmail.subscribe(queriedItems => {
      if (queriedItems && queriedItems[0]) {
        this.retriviedUid = queriedItems[0].key;
        let confirm = this.alertCtrl.create({
          title: 'Confirmar registro de cartão.',
          message: `<p>Deseja confirmar?</p>
            <ul>           
            <li>ID do cartão: `+ this.dataReceived.cardID + `</li>
            <li>UID do usuário: `+ this.retriviedUid + `</li>
          </ul>`,
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            }, {
              text: 'Confirmar',
              handler: () => {
                this.registerCardIDinUser();
              }
            }]
        });
        confirm.present();
      } else {
        let toast = this.myServices.criarToast('Usuário não encontrado.');
        toast.present();
      }
    }, error => { console.log(error) });
  }

  registerCardIDinUser() {
    this.afDatabase.object('/users/' + this.retriviedUid).update({ cardID: this.dataReceived.cardID }).then(success => {
      let toast = this.myServices.criarToast('Cartão registrado.');
      toast.present();
    })
      .catch(error => {
        console.log(error)
      });
  }

  locateUserCardID() {
    const queryObservable = this.cardId$.pipe(
      switchMap(cardId => {
        return this.afDatabase.list('/users', ref => ref.orderByChild('cardID').equalTo(cardId).limitToFirst(1)).valueChanges()
      })
    );
    // subscribe to changes
    queryObservable.subscribe(queriedItems => {
      if (queriedItems && queriedItems[0]) {
        this.queriedName = queriedItems[0]["name"];

        if (queriedItems[0]["cardSaldo"])
          this.userSaldo = queriedItems[0]["cardSaldo"];
        else
          this.userSaldo = 0;

        this.responseReady = true;

      } else {
        this.responseReady = false;
      }
    }, error => { console.log(error) });
  }

  getUidFromCardId() {
    const queryObservableUidFromCard = this.UidFromId$.pipe(
      switchMap(Id => {
        return this.afDatabase.list('/users', ref => ref.orderByChild('cardID').equalTo(Id).limitToFirst(1)).snapshotChanges();
      })
    );
    //subscribe to changes
    queryObservableUidFromCard.subscribe(queriedItems => {
      if (queriedItems && queriedItems[0]) {
        this.userUid = queriedItems[0].key;
      } else {
        let toast = this.myServices.criarToast('Usuário não encontrado.');
        toast.present();
      }
    }, error => { console.log(error) });
  }

  getItemById() {
    const queryObservableId = this.itemID$.pipe(
      switchMap(itemID => {
        return this.afDatabase.list('/produtos/bebida', ref => ref.orderByChild('id').equalTo(itemID).limitToFirst(1)).valueChanges()
      })
    );

    queryObservableId.subscribe(queriedItems => {
      if (queriedItems && queriedItems[0]) {
        this.itemPreco = queriedItems[0]["preco"];
        this.itemId = queriedItems[0]["id"];
        this.itemNome = queriedItems[0]["nome"];
      } else {
        let toast = this.myServices.criarToast('Produto não encontrado.');
        toast.present();
      }
    }, error => { console.log(error) });
  }

  checkProduct(itemId: string) {
    switch (itemId) {
      case "1":
        this.produtoId = this.prodList[0];
        break;
      case "2":
        this.produtoId = this.prodList[1];
        break;
      case "3":
        this.produtoId = this.prodList[2];
        break;
      case "4":
        this.produtoId = this.prodList[3];
        break;
      case "5":
        this.produtoId = this.prodList[4];
        break;
      case "6":
        this.produtoId = this.prodList[5];
        break;
      case "7":
        this.produtoId = this.prodList[6];
        break;
      case "8":
        this.produtoId = this.prodList[7];
        break;
      case "9":
        this.produtoId = this.prodList[8];
        break;
      default:
        this.produtoId = 0;
    }
    if (this.produtoId != 0) {
      this.itemID$.next(this.produtoId);
    }
  }

  registerBuy(itemNome: string, itemId: number, itemPreco: number) {
    let dataHoje = new Date();
    let qtd = 1;
    let precoTotal;

    this.afDatabase.object('/users/' + this.userUid + '/Lista de Compras/' + '/Compras Maquina/' + dataHoje.toLocaleDateString('pt-BR',
      { year: 'numeric', month: 'long', day: 'numeric' }) + '/' + itemNome + ' - ' + itemId).valueChanges().subscribe(res => {

        if (res && res["Qtd"]) {
          qtd = Number.parseInt(res["Qtd"]) + 1;
          precoTotal = itemPreco * qtd;
        } else {
          qtd = 1;
          precoTotal = itemPreco;
        }
      }, error => { console.log(error) });

    setTimeout(() => {
      if (precoTotal) {
        this.afDatabase.object('/users/' + this.userUid + '/Lista de Compras/' + '/Compras Maquina/' + dataHoje.toLocaleDateString('pt-BR',
          { year: 'numeric', month: 'long', day: 'numeric' }) + '/' + itemNome + ' - ' + itemId)
          .update({ Qtd: qtd, precoTotal: precoTotal })
          .then(success => {
            this.afDatabase.object('/users/' + this.userUid).update({ cardSaldo: (this.userSaldo - this.itemPreco) }).then().catch(err => { console.log(err) })
            let toast = this.myServices.criarToast('Compra em máquina pelo cliente (' + this.userUid + ') registrada.');
            toast.present();
          })
          .catch(error => {
            console.log(error)
          });
      }
    }, 2000);
  }

  sendResponse() {
    if (this.responseReady) {
      if ((this.userSaldo - this.itemPreco) >= 0) {
        console.log("datasended")
        this.escreverBT(this.queriedName + "\nSaldo: " + this.userSaldo.toString());
      } else {
        this.queriedName = "Error";
        this.escreverBT(this.queriedName);
      }
    } else {
      this.queriedName = "Null";
      this.escreverBT(this.queriedName);
    }
  }

  escreverBT(data: string) {
    this.bluetoothSerial.clear().then(sucess => {
      this.bluetoothSerial.write(data + '\r').then(sucess => {
      }).catch(error => console.log(error));
    }).catch(error => console.log(error));
  }
}
