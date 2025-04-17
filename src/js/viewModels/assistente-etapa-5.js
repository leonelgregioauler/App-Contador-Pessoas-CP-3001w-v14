define(['knockout',
        '../../dataBase'
],
function( ko, DataBase ) {

    function AssistenteEtapa5 (sessionState) {

        this.mensagemInfo1  = ko.observable('Concluímos a configuração do seu contador e você pode reativar os dados móveis do seu telefone!');
        this.mensagemInfo2  = ko.observable('Para aplicar as alterações, siga estes passos:');
        this.mensagemItem8  = ko.observable('8. Mantenha pressionado o botão (3) do contador até a barra de progresso completar e solte-o para iniciar a conexão na rede Wi-Fi que você selecionou.');
        this.mensagemItem9  = ko.observable('9. Aguarde o visor azul exibir a mensagem "Local" ou "Internet".');
        this.mensagemItem10 = ko.observable('10. Pressione o botão (3) durante 1 segundo e solte-o para ver o IP do contador na sua rede Wi-Fi.');
        this.mensagemItem11 = ko.observable('11. Conecte o seu telefone na rede Wi-Fi local.');
        this.mensagemItem12 = ko.observable('12. Toque nas abas "Diário", "Mensal" ou "Totais" para explorar os recursos do aplicativo.');

        const controller = {
            idControladora : 8888,
            descricaoControladora : 'Controladora CP3001w',
            IP : sessionState.IP(),
            URL : sessionState.URL(),
            fonteDados : 'URL',
            SSIDRoteador : sessionState.SSIDRoteador(),
            eMail : sessionState.eMail(),
            nomeEstabelecimento : sessionState.nomeEstabelecimento(),
            ramoAtividade : sessionState.ramoAtividade(),
            horaInicioTurno1: 6,
            horaFimTurno1: 11,
            horaInicioTurno2: 13,
            horaFimTurno2: 23,
            exibeDashBoard : {}
          }

        this.connected = () => {
            DataBase.insertController(controller);
        }
        
    }

    return AssistenteEtapa5;

});