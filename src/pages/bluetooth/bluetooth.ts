import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AlertController, Events } from 'ionic-angular';
import { MyServicesProvider } from '../../providers/my-services/my-services';
import { AngularFireDatabase } from 'angularfire2/database';
import { Subject } from 'rxjs/Subject';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../providers/auth/auth-service';

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
  isCardReg: Boolean;
  usersWithSameCard: any;
  forDeletingCards: Boolean;
  produtoIsFound: Boolean;

  dataReceived: {
    productID: any,
    cardID: any
  }

  constructor(private bluetoothSerial: BluetoothSerial,
    private alertCtrl: AlertController,
    private myServices: MyServicesProvider,
    private events: Events,
    private afDatabase: AngularFireDatabase,
    private authService: AuthService) {
    bluetoothSerial.enable();
    this.events.subscribe('BT:BluetoothData', rxData => {
      this.rxData = rxData;
    });

    this.dataReceived = {
      productID: '',
      cardID: ''
    }
        
    var authObserver = this.authService.loggedUserInfo().subscribe(user => {
      if(user == null) {
        bluetoothSerial.disconnect();
        authObserver.unsubscribe();
      }
    })

    this.index = 0;
    this.responseReady = false;
    this.isCardReg = false;
    this.usersWithSameCard = null;
    this.forDeletingCards = false;
    this.produtoIsFound = false;

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

          let prodIdAux = this.rxData.split(', ')[0];
          this.dataReceived["productID"] = prodIdAux.match(/\d+/g)[0];
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

  cardOrSaldoRegister() {
    let select = this.alertCtrl.create({
      title: 'Opções de cartão.',
      message: `"Cadastrar Cartão" ou "Adicionar Saldo"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Cartão',
          handler: () => {
            this.isCardReg = true;
            this.cardId$.next(this.dataReceived.cardID);
            this.getUserUidByEmail();
            this.cardRegister();
          }
        }, {
          text: 'Saldo',
          handler: () => {
            this.isCardReg = false;
            this.getUserUidByEmail();
            this.IDRegister();
          }
        }]
    });
    select.present();

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

  IDRegister() {
    if (this.typedEmail && this.dataReceived) {
      this.userUid$.next(this.typedEmail);
    } else if (!this.typedEmail) {
      let toast = this.myServices.criarToast('Campo email vazio.');
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
    let Obsv = queryObservableEmail.subscribe(queriedItems => {
      if (this.forDeletingCards) {
        this.forDeletingCards = false;
        this.afDatabase.object('/users/' + queriedItems[0].key).update({ cardID: '' })
          .then(sucess => Obsv.unsubscribe())
          .catch(error => { Obsv.unsubscribe(); console.log(error); });
        Obsv.unsubscribe();
      } else {
        if (queriedItems && queriedItems[0]) {
          this.retriviedUid = queriedItems[0].key;
          if (this.isCardReg) {
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
                  role: 'cancel',
                  handler: () => { Obsv.unsubscribe() }
                }, {
                  text: 'Confirmar',
                  handler: () => {
                    Obsv.unsubscribe();
                    this.isCardReg = false;
                    this.registerCardIDinUser();
                  }
                }]
            });
            confirm.present();
          } else {
            let confirm = this.alertCtrl.create({
              title: 'Adicionar saldo em cartão de usuário.',
              inputs: [
                {
                  name: 'saldo',
                  placeholder: 'Saldo a adicionar',
                  type: 'number'
                }
              ],
              message: `<p>Deseja confirmar?</p>
            <ul>            
            <li>UID do usuário: `+ this.retriviedUid + `</li>
          </ul>`,
              buttons: [
                {
                  text: 'Cancelar',
                  role: 'cancel',
                  handler: () => { Obsv.unsubscribe(); }
                }, {
                  text: 'Confirmar',
                  handler: (data) => {
                    Obsv.unsubscribe();
                    this.registerCardSaldoinUser(data.saldo, this.retriviedUid);
                  }
                }]
            });
            confirm.present();
            Obsv.unsubscribe();
            this.isCardReg = false;
          }
        } else {
          Obsv.unsubscribe();
          let toast = this.myServices.criarToast('Usuário não encontrado.');
          toast.present();
          this.isCardReg = false;
        }
      }
    }, error => { console.log(error) });
  }

  registerCardIDinUser() {
    if (this.usersWithSameCard) {
      let filterObj = this.usersWithSameCard.filter(obj => obj.email != this.typedEmail);
      filterObj.forEach(element => {
        alert("AVISO! O usuário '" + element.email + "' também está com este cartão cadastrado!\nEste terá o cartão de número '" +
          this.dataReceived.cardID + "' desvinculado!");
        this.forDeletingCards = true;
        this.getUserUidByEmail();
        this.userUid$.next(element.email);
      });
      this.usersWithSameCard = null;
    }
    this.afDatabase.object('/users/' + this.retriviedUid).update({ cardID: this.dataReceived.cardID }).then(success => {
      let toast = this.myServices.criarToast('Cartão registrado.');
      toast.present();
    })
      .catch(error => {
        console.log(error)
      });
  }

  registerCardSaldoinUser(saldoAdd: string, userUid: string) {
    var saldoAtual;
    var total;
    // var canWrite = false;
    let Obs = this.afDatabase.object('/users/' + userUid + '/cardSaldo').valueChanges()
      .subscribe(res => {
        if (res) {
          saldoAtual = res;
        } else {
          saldoAtual = 0;
        }
        total = saldoAtual + Number.parseFloat(saldoAdd);
        Obs.unsubscribe();

        this.afDatabase.object('/users/' + userUid).update({ cardSaldo: total }).then(sucess => {
          let toast = this.myServices.criarToast('Saldo de ' + saldoAdd.toString() + ' adicionado com sucesso! Novo saldo: ' + total);
          toast.present();
        }
        ).catch(err => { Obs.unsubscribe(); console.log(err) })
      }, error => { console.log(error) }
      )
  }

  locateUserCardID() {
    const queryObservable = this.cardId$.pipe(
      switchMap(cardId => {
        return this.afDatabase.list('/users', ref => ref.orderByChild('cardID').equalTo(cardId)).valueChanges()
      })
    );
    // subscribe to changes
    queryObservable.subscribe(queriedItems => {
      if (this.isCardReg && queriedItems.length > 0) {
        this.usersWithSameCard = queriedItems;
      } else {
        if (queriedItems && queriedItems[0]) {
          this.queriedName = queriedItems[0]["name"];

          if (queriedItems[0]["cardSaldo"])
            this.userSaldo = queriedItems[0]["cardSaldo"];
          else
            this.userSaldo = 0;

          this.responseReady = true;

        } else {
          this.queriedName = 'Null';                 
          this.responseReady = false;
        }
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

        this.produtoIsFound = true;
      } else {      
        this.produtoIsFound = false;
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

    let Obs = this.afDatabase.object('/users/' + this.userUid + '/Lista de Compras/' + '/Compras Maquina/' + dataHoje.toLocaleDateString('pt-BR',
      { year: 'numeric', month: 'long', day: 'numeric' }) + '/' + itemNome + ' - ' + itemId).valueChanges().subscribe(res => {

        if (res && res["Qtd"]) {
          qtd = Number.parseInt(res["Qtd"]) + 1;
          precoTotal = itemPreco * qtd;
        } else {
          qtd = 1;
          precoTotal = itemPreco;
        }

        Obs.unsubscribe();

        this.afDatabase.object('/users/' + this.userUid + '/Lista de Compras/' + '/Compras Maquina/' + dataHoje.toLocaleDateString('pt-BR',
          { year: 'numeric', month: 'long', day: 'numeric' }) + '/' + itemNome + ' - ' + itemId)
          .update({ Qtd: qtd, precoTotal: precoTotal })
          .then(success => {
            this.afDatabase.object('/users/' + this.userUid).update({ cardSaldo: ((this.userSaldo - this.itemPreco)>= 0) ? (this.userSaldo - this.itemPreco): 0 })
            .then(res => {
              this.resetVars();
              this.responseReady = false;
              this.produtoIsFound = false;
            }).catch(err => { console.log(err) })
            let toast = this.myServices.criarToast('Compra em máquina pelo cliente (' + this.userUid + ') registrada.');
            toast.present();
          })
          .catch(error => {
            console.log(error)
          });
      }, error => { console.log(error) });

    setTimeout(() => {

    }, 2000);
  }

  resetVars(){
    this.queriedName = '';
    this.userUid = '';
    this.itemPreco = 0;
    this.itemId = 0;
    this.itemNome = '';
    this.userSaldo = 0;
  }

  sendResponse() {
    if (this.responseReady && this.produtoIsFound) {
      if ((this.userSaldo - this.itemPreco) >= 0) {      
        this.escreverBT(this.queriedName + "\nSaldo: " + this.userSaldo.toString());
      } else {
        this.queriedName = "Error";
        this.escreverBT(this.queriedName);
      }
    } else if (!this.responseReady){
      this.queriedName = "ProdN";
      this.escreverBT(this.queriedName);
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
