/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
define(['knockout', 
        'appController', 
        'ojs/ojmodule-element-utils', 
        'accUtils', 
        '../httpUtil',
        '../dataBase',
        'viewModels/dashboard',
        'ojs/ojchart',
        'ojs/ojactioncard',
        'ojs/ojlabel',
        'ojs/ojdialog',
        'ojs/ojtoolbar',
        'ojs/ojbutton',
        'ojs/ojprogress-circle',
        'ojs/ojslider',
        'ojs/ojswitch'],
  function (ko, app, moduleUtils, accUtils, Util, DataBase, Dash) {

    function DashboardDiarioViewModel(params) {
      var self = this;

      self.stackValue = Dash.config.stackValue;
      self.orientationValue = Dash.config.orientationValue;
      self.lineTypeValue = Dash.config.lineTypeValue;
      self.labelPosition = Dash.config.labelPosition;
      
      self.showGraphicHour = Dash.config.showGraphicHour;
      
      self.showLoadingIndicator = Dash.config.showLoadingIndicator;
      self.showRequestRegister = Dash.config.showRequestRegister;
      self.showSlider = Dash.config.showSlider;

      self.indeterminate = Dash.config.indeterminate;
      self.progressValue = Dash.config.progressValue;

      self.maxValue = Dash.config.maxValue;
      self.minValue = Dash.config.minValue;
      self.actualValue = Dash.config.actualValue;
      self.transientValue = Dash.config.transientValue;
      self.stepValue = Dash.config.stepValue;

      self.identifyScreenSize = Dash.config.identifyScreenSize;
      
      self.restartButton = () => {
        self.indeterminate(-1);
        self.progressValue(0);
        self.createIntervalDaily();
      };
      
      self.buttonDisplay = Dash.config.buttonDisplay;
    
      self.total = Dash.config.total;
      self.controllerData = Dash.config.controllerData;

      let historicOfficeHourMorning = Dash.config.historicOfficeHourMorning;
      let historicOfficeHourAfternoon = Dash.config.historicOfficeHourAfternoon;
      self.colorWeek = Dash.config.colorWeek;
      self.dataSourceDataHour = Dash.config.dataSourceDataHour; 

      networkInformation = Dash.config.networkInformation;
      getNetworkInformation = Dash.config.getNetworkInformation;

      const controller = Dash.config.controller;

      // Header Config
      self.headerConfig = ko.observable({'view':[], 'viewModel':null});
      moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
        self.headerConfig({'view':view, 'viewModel': app.getHeaderModel()})
      })

      self.disabledValue = ko.observableArray();
      self.disableControls = ko.computed(() => {
        return self.disabledValue()[0];
      });

      const date = new Date();
      const dayWeek = date.getDay();
      
      self.days = new Array();
        self.days[0]  = { dia: 1, diaDescricao: 'seg', diaDescricaoCompleta: 'Seg' };
        self.days[1]  = { dia: 2, diaDescricao: 'ter', diaDescricaoCompleta: 'Ter' };
        self.days[2]  = { dia: 3, diaDescricao: 'qua', diaDescricaoCompleta: 'Qua' };
        self.days[3]  = { dia: 4, diaDescricao: 'qui', diaDescricaoCompleta: 'Qui' };
        self.days[4]  = { dia: 5, diaDescricao: 'sex', diaDescricaoCompleta: 'Sex' };
        self.days[5]  = { dia: 6, diaDescricao: 'sab', diaDescricaoCompleta: 'Sáb' };
        self.days[6]  = { dia: 7, diaDescricao: 'dom', diaDescricaoCompleta: 'Dom' };

      self.buttonSelectedValues = [ dayWeek ];

      self.selectDaysWeek = (data) => {
        self.buttonSelectedValues = data.detail.value;
        self.queryController();
      }
      
      self.returnColorDaysWeek = function(series) {

        /* if (series.id == 'Turno 1') {
          return self.colorWeek.colorOfficeHourMorning;
        } else if (series.id == 'Turno 2') {
          return self.colorWeek.colorOfficeHourAfternoon;
        } else */ 
        if (series.id == 'Seg') {
          return self.colorWeek.colorOfficeHoursMonday;
        } else if (series.id == 'Ter') {
          return self.colorWeek.colorOfficeHoursTuesday;
        } else if (series.id == 'Qua') {
          return self.colorWeek.colorOfficeHoursWednesday;
        } else if (series.id == 'Qui') {
          return self.colorWeek.colorOfficeHoursThursday;
        } else if (series.id == 'Sex') {
          return self.colorWeek.colorOfficeHoursFriday;
        } else if (series.id == 'Sáb') {
          return self.colorWeek.colorOfficeHoursSaturday;
        } else if (series.id == 'Dom') {
          return self.colorWeek.colorOfficeHoursSunday;
        }
      }

      self.queryController = async function () {

        let resultControl = await DataBase.queryController('SELECT * FROM CONTROLADORAS WHERE exibeDashBoard = 1');

        resultControl.forEach( (itemControl, idx) => {

          self.showRequestRegister(false);
          
          self.controllerData.descricaoControladora(itemControl.descricaoControladora);
          self.controllerData.IP(itemControl.IP);
          self.controllerData.URL(itemControl.URL);
          self.controllerData.dataSource(itemControl.fonteDados);

          const date = new Date();
          const hour = date.getHours();
          const minutes = date.getMinutes();
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const fullDate = date.toLocaleDateString('pt-br');

          Util.callGetService(itemControl, controller, 'TOTAL').then( (response) => {
            controller.dataTotal().splice(-controller.dataTotal().length);

            self.total.totalLotacao(response.sistema[0].lot);
            self.total.totalDay(response.sistema[0].total);
            self.total.dayMonthYear(fullDate);
          })
          .then( () => {
            
            endpointData = async () => {
              controller.dataHour().splice(-controller.dataHour().length);

              await Promise.all([endpoint()]);
            }
            
            endpointData().then( () => {

              let orderData = controller.dataHour().sort( (a, b) => {
                return a.seq - b.seq;
              })

              let indexInitialMorning = orderData.map(item => item.h).indexOf(itemControl.horaInicioTurno1);
              let indexInitialAfternoon = orderData.map(item => item.h).indexOf(itemControl.horaInicioTurno2);
              
              let quarter = orderData.filter((item) => {
                return item.h == hour;
              });
              let quarterFinalMoning = orderData.filter((item) => {
                return item.h == itemControl.horaFimTurno1;
              });
              let quarterFinalAfternoon = orderData.filter((item) => {
                return item.h == itemControl.horaFimTurno2;
              });
              
              let indexHour = orderData.map(item => item.h).indexOf(hour) + quarter.length;
              let indexFinalMorning = orderData.map(item => item.h).indexOf(itemControl.horaFimTurno1) + quarterFinalMoning.length;
              let indexFinalAfternoon = orderData.map(item => item.h).indexOf(itemControl.horaFimTurno2) + quarterFinalAfternoon.length;
            
              historicOfficeHourMorning   = orderData.slice(indexInitialMorning, (itemControl.horaFimTurno1 < hour) ? indexFinalMorning : indexHour);
              historicOfficeHourAfternoon = orderData.slice(indexInitialAfternoon, (itemControl.horaFimTurno2 < hour) ? indexFinalAfternoon : indexHour);
            
              let series = undefined;
              
              const detailsMorning = historicOfficeHourMorning.map((item) => {
                let hour = item.h
                let minute = item.m.toString().padEnd(2, 0);

                series = !item.series ? 'Turno 1' : item.series;
                
                return {
                  id: `${hour}:${minute}`,
                  series: series,
                  quarter: `${hour}:${minute}`,
                  group: 'Contador',
                  value: parseInt(item.v)
                }
              });
              
              const detailsAfternoon = historicOfficeHourAfternoon.map((item) => {
                let hour = item.h
                let minute = item.m.toString().padEnd(2, 0);

                series = !item.series ? 'Turno 2' : item.series;

                return {
                  id: `${hour}:${minute}`,
                  series: series,
                  quarter: `${hour}:${minute}`,
                  group: 'Contador',
                  value: parseInt(item.v)
                }
              });
              
              const detailsMorningAfternoon = [...detailsMorning, ...detailsAfternoon];

              self.total.avgDay(`Visitas/Hora: ${parseInt(self.total.totalLotacao() / (detailsMorningAfternoon.length == 0 ? 1 : detailsMorningAfternoon.length))}`);
              
              self.dataSourceDataHour[0].histHour.data = detailsMorningAfternoon;
              
              self.showGraphicHour(false);
              
              if ( (resultControl.length - 1) == idx) {
                self.showGraphicHour(true);
                self.showLoadingIndicator(false);
                self.showSlider(true);
              }
            })
          })
          .catch( (error) => {
            self.indeterminate(0);
            self.progressValue(Math.floor(Math.random() * 100));
            getNetworkInformation(error);
          })

          endpoint = async () => {

            let endpoint = await Util.callGetService(itemControl, controller, 'SEMANA').then( (response) => {
              controller.dataHour().splice(-controller.dataHour().length);

              if (self.buttonSelectedValues.length == 0) {
                // Aqui gera o gráfico com 1 linha
                response[self.days[dayWeek - 1].diaDescricao].forEach( (item) => {
                  controller.dataHour.push({
                    seq: parseInt(`${item.hora}`) * 100,
                    h: item.hora,
                    m: 0,
                    v: item.valor,
                  });               
                })
              } else {
                // Aqui gera o gráfico com n linhas
                self.days.forEach(day => {
                  response[day.diaDescricao].forEach( (item) => {

                    if (self.buttonSelectedValues.includes(day.dia)) {
                      controller.dataHour.push({
                        seq: parseInt(`${item.hora}`) * 100,
                        h: item.hora,
                        m: 0,
                        v: item.valor,
                        series: day.diaDescricaoCompleta
                      });
                    }
                  })
                })
              }
            })
          }
        })
      }
      
      self.clearIntervalDaily = function () { 
        clearInterval(Dash.config.intervalDaily());
        Dash.config.intervalDaily('');
      }

      self.createIntervalDaily = function () {

        if (params.router._activeState.path === 'dashboard-diario') {

          self.showLoadingIndicator(true);

          self.queryController();

          networkInformation.flagOnline = true;
          networkInformation.flagOffline = true;
        }
      }
      
      self.connected = function() {
        accUtils.announce('Dashboard Diário page loaded.');
        document.title = "Dashboard Diário";
        DataBase.createDataBase();

        window.addEventListener('orientationchange', self.identifyScreenSize);

        setTimeout(() => {
          self.createIntervalDaily();
          self.identifyScreenSize();
        }, 1000);
      };

      self.disconnected = function() {
        // Implement if needed
      };

      self.transitionCompleted = function() {
        // Implement if needed
      };
    }

    return DashboardDiarioViewModel;
  }
);
