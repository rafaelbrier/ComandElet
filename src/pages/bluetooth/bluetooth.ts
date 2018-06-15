import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AlertController, Events } from 'ionic-angular';
import { MyServicesProvider } from '../../providers/my-services/my-services';

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

  unpairedDevices: any;
  pairedDevices: any;
  gettingDevices: Boolean; 
  connectStatus: Boolean;
  rxData: string;
  
  constructor(private bluetoothSerial: BluetoothSerial,
              private alertCtrl: AlertController,
              private myServices: MyServicesProvider,
              private events: Events) {
    bluetoothSerial.enable();  
    this.events.subscribe('BT:BluetoothData', rxData => {
      this.rxData = rxData;
    });   
  }

  ionViewWillEnter(){
    this.bluetoothSerial.isConnected().then(res => {
      this.connectStatus = true;     
      this.rxData = lastData;
      connectedBTName = connectedBTName;      
    }).catch(error => {
      this.connectStatus = false;
      connectedBTName = '';
    })    
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
    if(this.bluetoothSerial.isEnabled()){
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
    if(this.connectStatus) {
    let alert = this.alertCtrl.create({
      title: 'Desconectar?',
      message: 'Você deseja Desconectar do dispositivo (' +connectedBTName+  ')?',
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

  readBluetoothData(){  
    this.bluetoothSerial.subscribeRawData().subscribe(res => {
      this.bluetoothSerial.read().then(data => {         
        if(data != "") {
        this.rxData = data;    
        lastData = this.rxData;   
        this.events.publish('BT:BluetoothData', this.rxData);           
        console.log(this.rxData)     
        }           
      }).catch(error => { 
        let toast = this.myServices.criarToast('Error ao receber dados do dispositivo Bluetooth (' +connectedBTName+  ').');
        toast.present();      
      });     
    }, error => {
      let toast = this.myServices.criarToast('Conexão perdida com dispositivo Bluetooth (' +connectedBTName+  ').');
      toast.present();     
    })  
  }
}
