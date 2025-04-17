define(['knockout', 'ojs/ojarraydataprovider'], 
  function (ko, ArrayDataProvider) {
    var self = this;

    self.stackValue = ko.observable("off");
    self.orientationValue = ko.observable("vertical");
    self.lineTypeValue = ko.observable("straight");
    self.labelPosition = ko.observable("aboveMarker");

    self.showGraphicMonth = ko.observable(false);
    self.showGraphicHour = ko.observable(false);

    self.showLoadingIndicator = ko.observable(true);
    self.showRequestRegister = ko.observable(true);
    self.showSlider = ko.observable(false);

    self.intervalDaily = ko.observable();
    self.intervalMonthly = ko.observable();
    self.indeterminate = ko.observable(-1);
    self.progressValue = ko.observable(0);

    self.maxValue = ko.observable();
    self.minValue = ko.observable();
    self.actualValue = ko.observable();
    self.transientValue = ko.observable();
    self.stepValue = ko.observable();

    self.networkInformation = {
      connectOnWiFi : 'Por favor, conecte-se à rede wi-fi do contador de pessoas.',
      connectionOffLine : 'Conexão Off-line.',
      connectionOnLine : 'Conexão On-line.',
      networkConnected : 'Dispositivo conectado à rede : \n',
      failedToFetch : 'Dispositivo contador de pessoas inacessível.',
      alertType : {
        alert: 'Alerta de Conexão',
        technicalInformation: 'Informações Técnicas'
      },
      confirmButton : ['OK', 'Detalhes'],
      alertButton : 'OK',
      IP: ko.observable(),
      subNet: ko.observable(),
      ipInformation : ko.observable(),
      subnetInformation : ko.observable(),
      errorOnGetWiFiAddress : ko.observable(),
      connection : ko.observable(),
      flagOnline : true,
      flagOffline : true
    };

    self.identifyScreenSize = () => {
      if (screen.width < 500) {
        self.maxValue(200);
        self.minValue(100);
        self.actualValue(150);
        self.transientValue();
        self.stepValue(10);
      } else {
        self.maxValue(400);
        self.minValue(100);
        self.actualValue(350);
        self.transientValue();
        self.stepValue(10);
      }
    }

    self.buttonDisplay = ko.pureComputed( () => {
      return self.progressValue() > 0 ? "inline-flex" : "none";
    });

    self.total = {
      totalLotacao : ko.observable(),
      totalDay : ko.observable(),
      dayMonthYear : ko.observable(),
      avgDay : ko.observable(),
      avgMonth : ko.observable()
    }

    self.controllerData = {
      descricaoControladora : ko.observable(),
      IP : ko.observable(),
      URL : ko.observable(),
      dataSource : ko.observable()
    }

    let historicMonth = new Array();
    let historicOfficeHourMorning = new Array();
    let historicOfficeHourAfternoon = new Array();
    
    self.colorWeek = {
      colorOfficeHourMorning : ko.observable('rgb(0 6 249)'),
      colorOfficeHourAfternoon : ko.observable('rgb(238 14 14)'),
      colorOfficeHoursMonday : ko.observable('gray'),
      colorOfficeHoursTuesday : ko.observable('green'),
      colorOfficeHoursWednesday : ko.observable('black'),
      colorOfficeHoursThursday : ko.observable('yellow'),
      colorOfficeHoursFriday : ko.observable('purple'),
      colorOfficeHoursSaturday : ko.observable('orange'),
      colorOfficeHoursSunday : ko.observable('red')
    }

    self.colorMonth = {
      colorOfficeHoursJanuary : ko.observable('gray'),
      colorOfficeHoursFebruary : ko.observable('green'),
      colorOfficeHoursMarch : ko.observable('black'),
      colorOfficeHoursApril : ko.observable('yellow'),
      colorOfficeHoursMay : ko.observable('purple'),
      colorOfficeHoursJune : ko.observable('orange'),
      colorOfficeHoursJuly : ko.observable('red'),
      colorOfficeHoursAugust : ko.observable('blue'),
      colorOfficeHoursSeptember : ko.observable('chocolate'),
      colorOfficeHoursOctober : ko.observable('olive'),
      colorOfficeHoursNovember : ko.observable('gold'),
      colorOfficeHoursDecember : ko.observable('greenyellow')
    }
    
    self.dataSourceDataHour = new Array({ histHour : new ArrayDataProvider([]) });
    self.dataSourceDataMonth = new Array({ histMonth : new ArrayDataProvider([]) });
    
    const controller = {
      parameterMes : 'jano',
      parameterSem : 'jsem', 
      parameterTotal : 'jano',

      parameterMesCloud : 'mes',
      parameterSemCloud : 'semana',
      parameterTotalCloud : 'mes',

      parameterConfiguration : 'aex',
      parameterAvailableSSIDs : 'jwi',

      parameterUpdateDate : 'ajd',
      parameterUpdateHour : 'ajh',
      parameterAdjustSensorDirection : 'ads',
      parameterAdjustOfficeHours : 'aje',

      dataMonth : ko.observableArray([]),
      dataHour : ko.observableArray([]),
      dataTotal : ko.observableArray([]),
      dataMonthList: ko.observableArray([])
    }

    function getNetworkInformation (data) {

      var networkState = navigator.connection.type;

      var states = {};
        states[Connection.UNKNOWN]  = 'Conexão desconhecida';
        states[Connection.ETHERNET] = 'Conexão de Rede';
        states[Connection.WIFI]     = 'Conexão Wi-Fi';
        states[Connection.CELL_2G]  = 'Conexão 2G';
        states[Connection.CELL_3G]  = 'Conexão 3G';
        states[Connection.CELL_4G]  = 'Conexão 4G';
        states[Connection.CELL]     = 'Conexão genérica';
        states[Connection.NONE]     = 'Sem conexão de rede';
        
        self.networkInformation.connection(states[networkState]);
      
      function onError( error ) {
        //alert('OnError ' + error);
        // Note: onError() will be called when an IP address can't be
        // found, e.g. WiFi is disabled, no SIM card, Airplane mode
        self.networkInformation.errorOnGetWiFiAddress(`\n${error}`);
        self.networkInformation.ipInformation('');
        self.networkInformation.subnetInformation('');

        if (self.networkInformation.flagOffline) {
          navigator.notification.confirm(
            self.networkInformation.connectOnWiFi,
            onConfirm,
            self.networkInformation.alertType.alert,
            self.networkInformation.confirmButton
          );
          self.networkInformation.flagOffline = false;
        }
      }
      
      function onSuccess( ipInformation ) {
        //alert('OnSuccess ' + ipInformation.ip + ' - ' + ipInformation.subnet + ' - ' + ipInformation);
        self.networkInformation.errorOnGetWiFiAddress('');

        const IP = (ipInformation.ip) ? ipInformation.ip : ipInformation;
        const subNet = (ipInformation.subnet) ? ipInformation.subnet : undefined;
        const ipInfo = (ipInformation.ip) ? `\nIP : ${ipInformation.ip}` : `\nIP : ${ipInformation}`;
        const subNetInfo = (ipInformation.subnet) ? `\nSub-rede : ${ipInformation.subnet}` : `\nSub-rede : Desconhecida.`;

        if (ipInformation) {
          self.networkInformation.IP(IP);
          self.networkInformation.subNet(subNet);
          self.networkInformation.ipInformation(ipInfo);
          self.networkInformation.subnetInformation(subNetInfo);
        } else {
          self.networkInformation.ipInformation('');
          self.networkInformation.subnetInformation('');
        }

        if (data) {
          navigator.notification.confirm(
            self.networkInformation.failedToFetch,
            onConfirm,
            self.networkInformation.alertType.alert,
            self.networkInformation.confirmButton
          );
          self.networkInformation.flagOffline = true;

        } else if ((states[networkState] = 'Conexão Wi-Fi') && self.networkInformation.flagOnline) {
          navigator.notification.confirm(
            self.networkInformation.connectionOnLine,
            onConfirm,
            self.networkInformation.alertType.alert,
            self.networkInformation.confirmButton
          ); 
          self.networkInformation.flagOnline = false;

        } else if (states[networkState] != 'Conexão Wi-Fi') {
          //alert('Você conectou em uma rede móvel. ' + states[networkState]);

          navigator.notification.confirm(
            self.networkInformation.connectionOnLine,
            onConfirm,
            self.networkInformation.alertType.alert,
            self.networkInformation.confirmButton
          );

        }
      }
      networkinterface.getWiFiIPAddress(onSuccess, onError);
    };

    function onConfirm(buttonIndex) {
      if (buttonIndex == 2) {
        navigator.notification.alert(
          self.networkInformation.networkConnected + 
          self.networkInformation.connection() + 
          self.networkInformation.ipInformation() + 
          self.networkInformation.subnetInformation() + 
          self.networkInformation.errorOnGetWiFiAddress(),
          null,
          self.networkInformation.alertType.technicalInformation,
          self.networkInformation.alertButton
        );
      }
    }

    function onOffline() {
      //alert('Offline');
      if (self.networkInformation.flagOffline) {
        getNetworkInformation();
      }
    }

    function onOnline() {
      //alert('Online');
      if (self.networkInformation.flagOnline) {
        getNetworkInformation();
      }
    }

    document.addEventListener("offline", onOffline, false);
    document.addEventListener("online", onOnline, false);
    
    return {
      config : {
        stackValue : self.stackValue,
        orientationValue : self.orientationValue,
        lineTypeValue : self.lineTypeValue,
        labelPosition : self.labelPosition,
        
        showGraphicMonth : self.showGraphicMonth,
        showGraphicHour : self.showGraphicHour,

        showLoadingIndicator : self.showLoadingIndicator,
        showRequestRegister : self.showRequestRegister,
        showSlider : self.showSlider,
        
        intervalDaily : self.intervalDaily,
        intervalMonthly : self.intervalMonthly,
        indeterminate : self.indeterminate,
        progressValue : self.progressValue,
        
        maxValue : self.maxValue,
        minValue : self.minValue,
        actualValue : self.actualValue,
        transientValue : self.transientValue,
        stepValue : self.stepValue,
        
        identifyScreenSize : self.identifyScreenSize,
        buttonDisplay : self.buttonDisplay,

        total : self.total,
        controllerData : self.controllerData,

        historicMonth : historicMonth,
        historicOfficeHourMorning : historicOfficeHourMorning,
        historicOfficeHourAfternoon : historicOfficeHourAfternoon,
        dataSourceDataHour : self.dataSourceDataHour,
        dataSourceDataMonth : self.dataSourceDataMonth,

        colorWeek : self.colorWeek,
        colorMonth : self.colorMonth,

        networkInformation : self.networkInformation,
        getNetworkInformation : getNetworkInformation,

        onOffline : onOffline,
        onOnline : onOnline,

        controller : controller
      }
    };
  });