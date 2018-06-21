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

@Component({
  selector: 'page-bluetooth',
  templateUrl: 'bluetooth.html',
})
export class BluetoothPage {

  cardId$: Subject<string>;
  queriedName: string;
  unpairedDevices: any;
  pairedDevices: any;
  gettingDevices: Boolean;
  connectStatus: Boolean;
  rxData: string;

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

    this.cardId$ = new Subject<string>();
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
    this.locateUser();
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
        if (data != "" && data.length > 2) {
          this.rxData = data;
          lastData = this.rxData;

          this.dataReceived["productID"] = this.rxData.split(', ')[0];
          let cardIdStr = this.rxData.split(', ')[1];;
          this.dataReceived["cardID"] = cardIdStr.replace(/(\r\n|\n|)/gm, '\r');

          if (this.dataReceived)
            this.cardId$.next(this.dataReceived.cardID);

        } else if (data != "" && data == "Ok\n") {
          this.registerBuy();
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

  registerBuy() {
    console.log("registerbuy")
  }

  locateUser() {
    const queryObservable = this.cardId$.pipe(
      switchMap(ID =>
        this.afDatabase.list('/users', ref => ref.orderByChild('cardID').equalTo(this.dataReceived.cardID)).valueChanges()
      )
    );
    // subscribe to changes
    queryObservable.subscribe(queriedItems => {
      if (queriedItems && queriedItems[0])
        this.queriedName = queriedItems[0]["name"];
      else
        this.queriedName = "Null\r";

      // this.bluetoothSerial.write(this.queriedName).then(sucess => {
      //   console.log(sucess)
      // }, ).catch(error => {
      //   console.log(error)
      // });

    });
  }
 

  escrever() {     
    this.bluetoothSerial.write(this.queriedName).then(sucess => {
      console.log(sucess)
    }, ).catch(error => {
      console.log(error)
    });
  }
}
