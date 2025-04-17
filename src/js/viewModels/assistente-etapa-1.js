define(['knockout',
        'viewModels/dashboard',
        'ojs/ojbutton'
],
function( ko, Dash ) {

    function AssistenteEtapa1 (sessionState) {

        networkInformation = Dash.config.networkInformation;
        getNetworkInformation = Dash.config.getNetworkInformation;

        this.mensagemInfo1 = ko.observable('Olá, vou ajudar você a conectar o Contador de Fluxo de Visitas CP3001w na rede Wi-Fi do seu estabelecimento!');
        this.mensagemInfo2 = ko.observable('O Local em que o contador será instalado tem sinal Wi-Fi?');
        this.mensagemItem1 = ko.observable('1. Deslize a barra superior de notificações do Android e conecte-se à sua rede Wi-Fi.');
        this.mensagemItem2 = ko.observable('2. Quando estiver conectado, avance para a próxima etapa.');

        this.selectedValueExisteConexaoWiFi = ko.observable('Sim');
        this.existeConexaoWiFiOptions = ko.observableArray([
            { id: 'Sim' },
            { id: 'Não' }
        ])

        this.setExisteConexaoWiFi = () => {
            sessionState.setValue('existeConexaoWiFi', this.selectedValueExisteConexaoWiFi());

            if (this.selectedValueExisteConexaoWiFi() == 'Sim') {
                this.IP(networkInformation.IP());
                sessionState.setValue('IP', networkInformation.IP());
            } else {
                this.IP('192.168.4.100');
                sessionState.setValue('IP', '192.168.4.100');
            }
        }

        this.IP = ko.observable(sessionState.IP());

        networkInformation.IP.subscribe( () => {
            let IP = networkInformation.IP();
            IP = IP.split('.');
            if (IP[2] == '4' && IP[3] > 1 ) {
                this.IP(undefined);
                sessionState.setValue('IP', undefined);
            } else {
                this.IP(networkInformation.IP());
                sessionState.setValue('IP', networkInformation.IP());
            }
        })
        networkInformation.subNet.subscribe( () => {
            sessionState.setValue('subNet', networkInformation.subNet());
        })

        this.getIPAddressAndSubNetMask = () => {
            networkInformation.flagOnline = true;
            networkInformation.flagOffline = true;

            getNetworkInformation();
        }

        this.transitionCompleted = () => {
            this.getIPAddressAndSubNetMask();

            document.addEventListener("offline", Dash.config.onOffline, false);
            document.addEventListener("online", Dash.config.onOnline, false);
        }
    }

    return AssistenteEtapa1;

});