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
        'ojs/ojarraydataprovider',
        'viewModels/dashboard',
        'ojs/ojchart',
        'ojs/ojactioncard',
        'ojs/ojlabel',
        'ojs/ojdialog',
        'ojs/ojtoolbar',
        'ojs/ojbutton',
        'ojs/ojprogress-circle',
        'ojs/ojslider',
        'ojs/ojselectsingle',
        'ojs/ojswitch'],
  function (ko, app, moduleUtils, accUtils, Util, DataBase, ArrayDataProvider, Dash) {

    function DashboardMensalViewModel(params) {
      var self = this;

      self.stackValue = Dash.config.stackValue;
      self.orientationValue = Dash.config.orientationValue;
      self.lineTypeValue = Dash.config.lineTypeValue;
      self.labelPosition = Dash.config.labelPosition;
      
      self.showGraphicMonth = Dash.config.showGraphicMonth;

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
        self.createIntervalMonthly();
      };
      
      self.buttonDisplay = Dash.config.buttonDisplay;

      self.total = Dash.config.total;
      self.totalList = Dash.config.total;
      self.controllerData = Dash.config.controllerData;
      
      let historicMonth = Dash.config.histMonth;
      let historicMonthList = Dash.config.histMonth;
      self.colorMonth = Dash.config.colorMonth;
      self.dataSourceDataMonth = Dash.config.dataSourceDataMonth;
      
      networkInformation = Dash.config.networkInformation;
      getNetworkInformation = Dash.config.getNetworkInformation;

      const controller = Dash.config.controller;      
      
      self.buttonSelectedValuesObservable = ko.observableArray();

      self.isMonthSelected = ko.computed(function () {
        if (self.buttonSelectedValuesObservable()) {
          if (self.buttonSelectedValuesObservable().length == 1) {
            return false;
          } else {
            return true;
          }
        }
        return true;
      });

      // Header Config
      self.headerConfig = ko.observable({'view':[], 'viewModel':null});
      moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
        self.headerConfig({'view':view, 'viewModel': app.getHeaderModel()})
      })

      self.disabledValue = ko.observableArray();
      self.disableControls = ko.computed(() => {
        return self.disabledValue()[0];
      });

      const mesesAbreviados = new Array(12);
      mesesAbreviados['jan']  = {mes:  1, mesDescricaoCompleta: 'Janeiro'};
      mesesAbreviados['fev']  = {mes:  2, mesDescricaoCompleta: 'Fevereiro'};
      mesesAbreviados['mar']  = {mes:  3, mesDescricaoCompleta: 'Março'};
      mesesAbreviados['abr']  = {mes:  4, mesDescricaoCompleta: 'Abril'};
      mesesAbreviados['mai']  = {mes:  5, mesDescricaoCompleta: 'Maio'};
      mesesAbreviados['jun']  = {mes:  6, mesDescricaoCompleta: 'Junho'};
      mesesAbreviados['jul']  = {mes:  7, mesDescricaoCompleta: 'Julho'};
      mesesAbreviados['ago']  = {mes:  8, mesDescricaoCompleta: 'Agosto'};
      mesesAbreviados['set']  = {mes:  9, mesDescricaoCompleta: 'Setembro'};
      mesesAbreviados['out']  = {mes: 10, mesDescricaoCompleta: 'Outubro'};
      mesesAbreviados['nov']  = {mes: 11, mesDescricaoCompleta: 'Novembro'};
      mesesAbreviados['dez']  = {mes: 12, mesDescricaoCompleta: 'Dezembro'};

      self.months = new Array(12);
        self.months[0]   = {mes:  1, mesDescricao: 'jan', mesDescricaoCompleta: 'Jan' };
        self.months[1]   = {mes:  2, mesDescricao: 'fev', mesDescricaoCompleta: 'Fev' };
        self.months[2]   = {mes:  3, mesDescricao: 'mar', mesDescricaoCompleta: 'Mar' };
        self.months[3]   = {mes:  4, mesDescricao: 'abr', mesDescricaoCompleta: 'Abr' };
        self.months[4]   = {mes:  5, mesDescricao: 'mai', mesDescricaoCompleta: 'Mai' };
        self.months[5]   = {mes:  6, mesDescricao: 'jun', mesDescricaoCompleta: 'Jun' };
        self.months[6]   = {mes:  7, mesDescricao: 'jul', mesDescricaoCompleta: 'Jul' };
        self.months[7]   = {mes:  8, mesDescricao: 'ago', mesDescricaoCompleta: 'Ago' };
        self.months[8]   = {mes:  9, mesDescricao: 'set', mesDescricaoCompleta: 'Set' };
        self.months[9]   = {mes: 10, mesDescricao: 'out', mesDescricaoCompleta: 'Out' };
        self.months[10]  = {mes: 11, mesDescricao: 'nov', mesDescricaoCompleta: 'Nov' };
        self.months[11]  = {mes: 12, mesDescricao: 'dez', mesDescricaoCompleta: 'Dez' };

      const date = new Date();
      const monthYear = date.getMonth() + 1;

      self.buttonSelectedValues = [ monthYear ];
      
      self.selectMonthsYear = (data) => {
        self.buttonSelectedValues = data.detail.value;
        self.queryController();

        self.buttonSelectedValuesObservable(self.buttonSelectedValues);
      }
      
      self.returnColorMonthYear = function(series) {

        //self.buttonSelectedValues.length == 0 ? self.colorOfficeHourMorning : null;

        if (series.id == 'Jan') {
          return self.colorMonth.colorOfficeHoursJanuary;
        } else if (series.id == 'Fev') {
          return self.colorMonth.colorOfficeHoursFebruary;
        } else if (series.id == 'Mar') {
          return self.colorMonth.colorOfficeHoursMarch;
        } else if (series.id == 'Abr') {
          return self.colorMonth.colorOfficeHoursApril;
        } else if (series.id == 'Mai') {
          return self.colorMonth.colorOfficeHoursMay;
        } else if (series.id == 'Jun') {
          return self.colorMonth.colorOfficeHoursJune;
        } else if (series.id == 'Jul') {
          return self.colorMonth.colorOfficeHoursJuly;
        } else if (series.id == 'Ago') {
          return self.colorMonth.colorOfficeHoursAugust;
        } else if (series.id == 'Set') {
          return self.colorMonth.colorOfficeHoursSeptember;
        } else if (series.id == 'Out') {
          return self.colorMonth.colorOfficeHoursOctober;
        } else if (series.id == 'Nov') {
          return self.colorMonth.colorOfficeHoursNovember;
        } else if (series.id == 'Dez') {
          return self.colorMonth.colorOfficeHoursDecember;
        }
      }

      let resultControl = '';

      self.queryController = async (mesAnterior) => {

        resultControl = await DataBase.queryController('SELECT * FROM CONTROLADORAS WHERE exibeDashBoard = 1');

        resultControl.forEach( (itemControl, idx) => {

          self.showRequestRegister(false);

          self.controllerData.descricaoControladora(itemControl.descricaoControladora);
          self.controllerData.IP(itemControl.IP);
          self.controllerData.URL(itemControl.URL);
          self.controllerData.dataSource(itemControl.fonteDados);

          const date = new Date();
          const hour = date.getHours();
          const day = date.getDate();
          const month = mesAnterior || date.getMonth() + 1;
          const year = date.getFullYear();
          const fullDate = date.toLocaleDateString('pt-br');
          const monthYear = date.toLocaleDateString('pt-br', {
            month : 'long',
            year : 'numeric'
          });

          Util.callGetService(itemControl, controller, 'TOTAL').then( (response) => {
            controller.dataTotal().splice(-controller.dataTotal().length);

            self.total.totalLotacao(response.sistema[0].lot);
            self.total.totalDay(response.sistema[0].total);
            self.total.dayMonthYear(fullDate);
          })
          .then( () => {
            endpointData = async () => {
              controller.dataMonth().splice(-controller.dataMonth().length);

              await Promise.all([endpoint()]);
            }
  
            endpointData().then( () => {
              let orderData = controller.dataMonth().sort( (a, b) => {
                return a.d - b.d;
              });
  
              self.buttonSelectedValues.length > 0 ? historicMonth = orderData : historicMonth = orderData.slice(0, day);

              let series = undefined;
  
              const details = historicMonth.map((item) => {
                series = !item.series ? `${monthYear} - ${self.total.totalDay()} visitas.` : item.series;

                return {
                  id: item.d,
                  series: series,
                  quarter: item.d,
                  group: 'Contador',
                  value: parseInt(item.v)
                }
              });

              let totalDiasMovimento = new Array;
              historicMonth.forEach((item) => {
                if ( parseInt(item.v) > 0 ) {
                  totalDiasMovimento.push(idx);
                  return;
                }
              })

              self.total.avgMonth(`Visitas/Dia: ${parseInt(self.total.totalDay() / (totalDiasMovimento.length == 0 ? 1 : totalDiasMovimento.length))}`);
  
              self.dataSourceDataMonth[0].histMonth.data = details;

              let totalVisitantesMes = historicMonth.reduce( (accumulator, object) => {
                return accumulator + parseInt(object.v);
              }, 0)

              self.showGraphicMonth(false);
  
              if ( (resultControl.length - 1) == idx) {
                self.showGraphicMonth(true);
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
            let endpoint = await Util.callGetService(itemControl, controller, 'MES').then( (response) => {
              
              controller.dataMonth().splice(-controller.dataMonth().length);
              
              if (self.buttonSelectedValues.length == 0) {
                // Aqui gera o gráfico com 1 linha
                response[self.months[month - 1].mesDescricao].forEach( (item) => {
                  controller.dataMonth.push({
                    d: item.dia,
                    h: 0,
                    v: item.valor
                  });
                })
              } else {
                // Aqui gera o gráfico com n linhas
                self.months.forEach(month => {
                  response[month.mesDescricao].forEach( (item) => {

                    if (self.buttonSelectedValues.includes(month.mes)) {
                      controller.dataMonth.push({
                        d: item.dia,
                        h: 0,
                        v: item.valor,
                        series: month.mesDescricaoCompleta
                      });
                    }             
                  })
                })
              }
            })
          }
        })
      }
      
      let resultControlList = '';
       
      self.createIntervalMonthly = function () {

        if (params.router._activeState.path === 'dashboard-mensal') {

          self.showLoadingIndicator(true);
          
          self.queryController();

          networkInformation.flagOnline = true;
          networkInformation.flagOffline = true;
        }
      }

      self.close = function(event) {
        document.getElementById("modalDialogArquivoGerado").close();
      }
      self.open = function(event) {
        document.getElementById("modalDialogArquivoGerado").open();
      }

      self.closeAviso = function(event) {
        document.getElementById("modalDialogSemDadosHistorico").close();
      }
      self.openAviso = function(event) {
        document.getElementById("modalDialogSemDadosHistorico").open();
      }

      self.openGerarExcelLista = function(event) {
        document.getElementById("modalDialogGerarExcelLista").open();
      }

      self.closeGerarExcelLista = function(event) {
        document.getElementById("modalDialogGerarExcelLista").close();
      }

      self.abrirListaOpcoes = function(event) {

      }

      self.gerarExcel = async () => {

        let endpoint = await Util.callGetService(resultControl[0], controller, 'MES').then( (response) => {
        const { sistema, ...meses } = response;

        let totalVisitantesMeses = new Array();

        let indexMes = 0;
        let indexMesAtual = 0;

        Object.keys(meses).forEach((item, index) => {
          console.log(meses[item]);

          let mesTotal = meses[item].reduce( (accumulator, object) => {
            return accumulator + parseInt(object.valor);
          }, 0)

          const dataAtual = new Date();
          const anoAtual = dataAtual.getFullYear();
          const mesAtualAbreviado = dataAtual.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');

          indexMes = mesesAbreviados[item].mes;
          indexMesAtual = mesesAbreviados[mesAtualAbreviado].mes;
          mesDescricaoCompleta = mesesAbreviados[item].mesDescricaoCompleta;

          if (indexMes > indexMesAtual) {
            anoHistorico = anoAtual - 1;
            mesHistorico = indexMes;
          } else {
            anoHistorico = anoAtual;
            mesHistorico = indexMes;
          }

          totalVisitantesMeses.push({
            "AnoMesDia": `${anoHistorico}${mesHistorico.toString().padStart(2, '0')}`,
            "mesDescricaoCompleta" : mesDescricaoCompleta,
            "mesTotal" : mesTotal
          })
        })

        let orderData = totalVisitantesMeses.sort( (a, b) => {
            return a.AnoMesDia - b.AnoMesDia;
        });

        let CSVData = `Data;Visitantes\n` + orderData.map( (item) => {
            return `${item.AnoMesDia};${item.mesTotal}`;
        }).join('\n');

        //application/vnd.ms-excel
        //application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
        let excel = new Blob([CSVData], { type: 'text/csv'});

        if (totalVisitantesMeses.length == 0) {
          self.openAviso();
        } else {
          Util.ReadWriteFilesDeviceMediaStore(CSVData, `Relatório Mensal.csv`, `CP 3001 - Relatório Mensal`).then( (result) => {
            if (result) {
              self.open();
            }
          })
        }
        self.closeGerarExcelLista();
        })
      };
      
      self.gerarExcelDetalhes = async () => {

        let endpoint = await Util.callGetService(resultControl[0], controller, 'MES').then( (response) => {

          let indexMes = 0;
          let indexMesAtual = 0;

          resultControlList = response[Object.keys(response)[self.buttonSelectedValues]];
          
          const dataAtual = new Date();
          const anoAtual = dataAtual.getFullYear();
          const mesAtualAbreviado = dataAtual.toLocaleString('pt-BR', { month: 'long' }).replace('.', '').slice(0, 3);

          indexMes = self.buttonSelectedValues[0];
          indexMesAtual = mesesAbreviados[mesAtualAbreviado].mes;

          if (indexMes > indexMesAtual) {
            anoHistorico = anoAtual - 1;
            mesHistorico = indexMes;
          } else {
            anoHistorico = anoAtual;
            mesHistorico = indexMes;
          }

          anoMesDia = `${anoHistorico}${mesHistorico.toString().padStart(2, '0')}`
          
          let orderDataDetails = resultControlList.sort( (a, b) => {
            return a.dia - b.dia;
          });

          let iterator = orderDataDetails[Symbol.iterator]();

          let CSVData = `Data;Entrada;Saída`;

          for (const line of iterator) {
            if (line.dia) {
              line ? CSVData = `${CSVData}\n${anoMesDia}${line.dia.toString().padStart(2, '0')};${line.valor};0` : null;
            }
          }

          CSVData = `${CSVData}\n ;${self.totalList.totalLotacao()};0`;

          let excel = new Blob([CSVData], { type: 'text/csv' });

          if (resultControlList.length == 0) {
            self.openAviso();
          } else {
            Util.ReadWriteFilesDeviceMediaStore(CSVData, `Relatório Mensal Detalhado.csv`, `CP 3001 - Relatório Mensal Detalhado`).then( (result) => {
              if (result) {
                self.open();
              }
            })
          }
          self.closeGerarExcelLista();
        })
      }

      self.connected = function() {
        accUtils.announce('Dashboard Mensal page loaded.');
        document.title = "Dashboard Mensal";
        window.addEventListener('orientationchange', self.identifyScreenSize);
        self.createIntervalMonthly();
        self.identifyScreenSize();
      };
      
      self.disconnected = function() {
        // Implement if needed
      };

      self.transitionCompleted = function() {
        // Implement if needed
      };
    }

    return DashboardMensalViewModel;
  }
);
