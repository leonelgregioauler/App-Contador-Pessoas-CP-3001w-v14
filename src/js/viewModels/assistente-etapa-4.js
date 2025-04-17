define(['knockout',
        'ojs/ojarraydataprovider',
        'viewModels/dashboard',
        '../../httpUtil',
        'ojs/ojformlayout',
        'ojs/ojselectsingle',
        'ojs/ojinputtext'
],
function( ko, ArrayDataProvider, Dash, Util ) {

    function AssistenteEtapa4 (sessionState) {

        this.showLoadingIndicator = Dash.config.showLoadingIndicator;
        this.indeterminate = Dash.config.indeterminate;
        this.progressValue = Dash.config.progressValue;
        this.buttonDisplay = Dash.config.buttonDisplay;

        const controller = Dash.config.controller;

        this.controllerRegistration = {
            URL : ko.observable(''),
            SSIDRoteador : ko.observable(''),
            senhaRoteador : ko.observable(''),
            eMail : ko.observable(''),
            nomeEstabelecimento : ko.observable(''),
            ramoAtividade : ko.observable('')
        }

        this.isDeviceConnected = ko.computed( () => {
            return sessionState.isDeviceConnected();
        });
        
        /* this.isSSIDPasswordEmpty = ko.computed( () => {
            return !( this.controllerRegistration.SSIDRoteador() && this.controllerRegistration.senhaRoteador() )
        }); */

        this.dataSourceSSID = ko.observableArray();
        this.selectListValueChangedSSID = (data) => {
            this.controllerRegistration.SSIDRoteador(data.detail.value);
            this.setSSIDRoteador();
        }
        
        this.setURL = () => {
            sessionState.setValue('URL', this.controllerRegistration.URL());
        }
        this.setSSIDRoteador = () => {
            sessionState.setValue('SSIDRoteador', this.controllerRegistration.SSIDRoteador());
        }
        this.setSenhaRoteador = () => {
            sessionState.setValue('senhaRoteador', this.controllerRegistration.senhaRoteador());
        }
        this.setEmail = () => {
            sessionState.setValue('eMail', this.controllerRegistration.eMail());
        }
        this.setNomeEstabelecimento = () => {
            sessionState.setValue('nomeEstabelecimento', this.controllerRegistration.nomeEstabelecimento());
        }
        this.setNomeRamoAtividade = () => {
            sessionState.setValue('ramoAtividade', this.controllerRegistration.ramoAtividade());
        }
        

        this.mensagemInfo1 = ko.observable('Vamos configurar o contador na sua rede Wi-Fi local.');
        this.mensagemInfo2 = ko.observable('Quando estiver tudo correto, avance para a próxima etapa.');

        this.mensagemInfo = ko.observable();
        
        sessionState.setValue('isDeviceConnected', false);

        this.updateParameters = (response) => {

            const [ dados ] = response.sistema;
            const { id, rede, pass, email, nome, ramo } = dados;

            this.controllerRegistration.URL(id)
            this.controllerRegistration.SSIDRoteador(rede);
            this.controllerRegistration.senhaRoteador(pass);
            this.controllerRegistration.eMail(email);
            this.controllerRegistration.nomeEstabelecimento(nome);
            this.controllerRegistration.ramoAtividade(ramo);
        }

        this.getConfigurations = () => {

            this.showLoadingIndicator(true);
            this.indeterminate(-1);
            this.progressValue(0);

            let itemControl = {
                fonteDados : "IP",
                IP : '192.168.4.1'
            }
            
            Util.callGetService(itemControl, controller, 'AVAILABLE_SSIDS', true)
            .then( (response) => {

                wifi = response.wifi.map(item => {
                return {
                    value: item.ssid,
                    label: item.ssid
                }
                })
                this.dataSourceSSID(wifi);
                
                this.dataSourceSSIDDP = ko.observable(new ArrayDataProvider(this.dataSourceSSID, { keyAttributes: 'value' }));

                setTimeout(() => {
                    Util.callGetService(itemControl, controller, 'CONFIGURACAO', true)
                    .then( (response) => {
                        sessionState.setValue('isDeviceConnected', true);
                        this.showLoadingIndicator(false);
                        this.indeterminate(0);
                        this.progressValue(Math.floor(Math.random() * 100));
                        this.updateParameters(response);
                    })
                    .catch( (error) => {
                        console.log('Não encontrou dispositivo conectado.' + error);
                        this.mensagemInfo(error);
                        this.indeterminate(0);
                        this.progressValue(Math.floor(Math.random() * 100));
                    })
                }, 2000);
            })
            .catch(error => {
                console.log('Não encontrou dispositivo conectado.' + error);
                this.mensagemInfo(error);
                this.indeterminate(0);
                this.progressValue(Math.floor(Math.random() * 100));
            })
        }
        this.dataSourceSSIDDP = ko.observable(new ArrayDataProvider(this.dataSourceSSID, { keyAttributes: 'value' }));

        this.connectToDevice = async () => {

            let gateWay = networkInformation.IP();
            gateWay = gateWay.split('.').slice(0, 3);
            gateWay.push("1");
            gateWay = gateWay.join('.');

            let itemControl = {
              fonteDados : "XX",
              IP : '192.168.4.1',
              gateWay : gateWay,
              URL : this.controllerRegistration.URL(),
              SSIDRoteador: this.controllerRegistration.SSIDRoteador(),
              senhaRoteador: this.controllerRegistration.senhaRoteador(),
              eMail: this.controllerRegistration.eMail(),
              nomeEstabelecimento: this.controllerRegistration.nomeEstabelecimento(),
              ramoAtividade: this.controllerRegistration.ramoAtividade(),
              subNet: networkInformation.subNet()
            }
    
            let endpoint1 = await Util.callGetService(itemControl, controller, 'ATUALIZAR_CONFIGURACAO_DISPOSITIVO')
            .then( (response) => {
                if (response) {
                    this.setURL();
                    //this.setSenhaRoteador();
                }
            })
        }


        this.connected = () => {
            this.getConfigurations();
        }
        
        this.disconnected = () => {
            this.connectToDevice();
        }
    }

    return AssistenteEtapa4;

});