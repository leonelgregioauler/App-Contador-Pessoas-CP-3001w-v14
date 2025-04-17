define(['knockout'
],
function( ko ) {

    function AssistenteEtapa3 (sessionState) {

        this.mensagemInfo1 = ko.observable('Vamos conectar o seu celular na rede Wi-Fi cp3001w do contador.');
        this.mensagemItem4 = ko.observable('4. Deslize a barra superior de notificações do Android e desligue os dados móveis.');
        this.mensagemItem5 = ko.observable('5. Toque e mantenha o dedo pressionado no ícone do Wi-Fi para abrir as configurações de conexão e conecte-se na rede cp3001w.');
        this.mensagemItem6 = ko.observable('6. Toque em Concluído para manter a conexão com a rede cp3001w.');
        this.mensagemItem7 = ko.observable('7. Avance para a próxima etapa.');
    }

    return AssistenteEtapa3;

});