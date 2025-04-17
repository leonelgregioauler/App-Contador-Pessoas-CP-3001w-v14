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

        function TotalizadoresViewModel(params) {
            var self = this;

            self.showLoadingIndicator = Dash.config.showLoadingIndicator;
            self.showRequestRegister = Dash.config.showRequestRegister;
            self.showSlider = Dash.config.showSlider;

            self.indeterminate = Dash.config.indeterminate;
            self.progressValue = Dash.config.progressValue;

            self.maxValue = Dash.config.maxValue;
            self.minValue = Dash.config.minValue;
            self.actualValue = Dash.config.actualValue;
            self.transientValue = Dash.config.transientValue;

            self.identifyScreenSize = Dash.config.identifyScreenSize;

            self.restartButton = () => {
                self.indeterminate(-1);
                self.progressValue(0);
                self.createIntervalDaily();
            };

            self.buttonDisplay = Dash.config.buttonDisplay;

            self.total = Dash.config.total;

            networkInformation = Dash.config.networkInformation;
            getNetworkInformation = Dash.config.getNetworkInformation;

            const controller = Dash.config.controller;

            // Header Config
            self.headerConfig = ko.observable({'view':[], 'viewModel':null});
            moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
                self.headerConfig({'view':view, 'viewModel': app.getHeaderModel()})
            })

            self.queryController = async function () {

                let resultControl = await DataBase.queryController('SELECT * FROM CONTROLADORAS WHERE exibeDashBoard = 1');
        
                resultControl.forEach( (itemControl, idx) => {

                    self.showRequestRegister(false);

                    Util.callGetService(itemControl, controller, 'TOTAL')
                    .then( (response) => {        
                        self.total.totalLotacao(response.sistema[0].lot);
                        self.total.totalDay(response.sistema[0].total);
                    })
                    .then( () => {
                        console.log('then');

                        if ( (resultControl.length - 1) == idx) {
                            self.showLoadingIndicator(false);
                            self.showSlider(true);
                        }
                    })
                    .catch( (error) => {
                        self.indeterminate(0);
                        self.progressValue(Math.floor(Math.random() * 100));
                        getNetworkInformation(error);
                    })
                })
            }

            self.createIntervalDaily = function () {
        
                if (params.router._activeState.path === 'totalizadores') {
    
                    self.showLoadingIndicator(true);
    
                    self.queryController();
                }
            }

            self.connected = function() {
                accUtils.announce('Totalizadores page loaded.');
                document.title = "Totalizadores";
        
                window.addEventListener('orientationchange', self.identifyScreenSize);
        
                self.createIntervalDaily();
                self.identifyScreenSize();
            };
    
            self.disconnected = function() {
                // Implement if needed
            };
    
            self.transitionCompleted = function() {
                // Implement if needed
            };
        }
        return TotalizadoresViewModel;
    }
);