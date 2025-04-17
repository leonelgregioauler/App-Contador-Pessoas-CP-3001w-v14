define(['knockout'
],
function( ko ) {

    function AssistenteEtapa2 (sessionState) {

        this.mensagemInfo1 = ko.observable('Observe se o visor azul do CP3001w exibe o nome cp3001w seguido de dois dígitos.');
        this.mensagemInfo2 = ko.observable('Se não exibir, mantenha pressionado o botão (3) do contador até a barra de progresso completar e solte-o para ativar a rede Wi-Fi cp3001w.');
        this.mensagemItem3 = ko.observable('3. Quando o visor exibir "cp3001w", avançe para a próxima etapa.');

    }

    return AssistenteEtapa2;

});