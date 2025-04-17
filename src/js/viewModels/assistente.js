/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your about ViewModel code goes here
 */
define(['knockout',
        'ojs/ojmodule-element-utils',
        'ojs/ojmodule-element',
        'ojs/ojbutton',
        'ojs/ojmoduleanimations',
        'ojs/ojprogress-bar',
        'ojs/ojprogress-circle'],
 function(ko, ModuleElementUtils) {

    function AssistenteViewModel() {

      this.ModuleElementUtils = ModuleElementUtils;

      this.progressBarValue = ko.observable(33);
      
      this.viewModelPath = ko.observable('js/viewModels/');
      this.viewPath = ko.observable('views/');
      this.currentModule = ko.observable('assistente-etapa-1');
      this.indexCurrentModule = ko.observable(0);

      this.listModules = ko.observableArray([
        { id: 1, modulo: 'assistente-etapa-1', percentComplete:  20},
        { id: 2, modulo: 'assistente-etapa-2', percentComplete:  40},
        { id: 3, modulo: 'assistente-etapa-3', percentComplete:  60},
        { id: 4, modulo: 'assistente-etapa-4', percentComplete:  80},
        { id: 5, modulo: 'assistente-etapa-5', percentComplete: 100}
      ]);

      this.currentAnimation = "pushStart";

      this.moduleAnimation = ko.pureComputed(
        function () {
          if (this.currentModule()) {
            return oj.ModuleAnimations[this.currentAnimation];
          }
          return null;
        }.bind(this)
      ).bind(this);

      this.voltarModulo = () => {
        this.currentAnimation = 'pushEnd';
        if (this.indexCurrentModule() > 0) {
          this.indexCurrentModule(this.indexCurrentModule() - 1);
          this.currentModule(this.listModules()[this.indexCurrentModule()].modulo);
          this.progressBarValue(this.listModules()[this.indexCurrentModule()].percentComplete);
        }
      }
      this.avancarModulo = () => {
        this.currentAnimation = 'pushStart';
        if (this.indexCurrentModule() < this.listModules().length - 1) {
          this.indexCurrentModule(this.indexCurrentModule() + 1);
          this.currentModule(this.listModules()[this.indexCurrentModule()].modulo);
          this.progressBarValue(this.listModules()[this.indexCurrentModule()].percentComplete);
        } 
      }

      this.setValue = (key, value) => {
        this.sessionState[key](value);
      }
      this.getValue = (key) => {
        return this.sessionState[key]();
      }

      this.sessionState = {

        progressCircleValue : ko.observable(-1),

        existeConexaoWiFi : ko.observable(),
        
        IP : ko.observable(),
        URL : ko.observable(),
        subNet : ko.observable(),
        SSIDRoteador : ko.observable(),
        senhaRoteador : ko.observable(),
        eMail : ko.observable(),
        nomeEstabelecimento : ko.observable(),
        ramoAtividade : ko.observable(),
        isDeviceConnected : ko.observable(false),
        
        setValue : this.setValue,
        getValue : this.getValue

      };

      this.disabledButtonVoltar = ko.computed(() => {
        return this.indexCurrentModule() == 0;
      })

      this.disabledButtonAvancar = ko.computed(() => {
        return ( this.indexCurrentModule() == 0 && !this.sessionState.IP() ) ||
               ( this.indexCurrentModule() == 3 &&  this.sessionState.IP() && !this.sessionState.isDeviceConnected() ) ||
               ( this.indexCurrentModule() == 3 &&  this.sessionState.IP() &&  this.sessionState.isDeviceConnected() && !this.sessionState.SSIDRoteador() ) ||
               ( this.indexCurrentModule() == 3 &&  this.sessionState.IP() &&  this.sessionState.isDeviceConnected() && !this.sessionState.senhaRoteador() ) ||
                 this.indexCurrentModule() == 4;
      })

      this.connected = function() {
        document.title = "Assistente";
      };

    }
    return new AssistenteViewModel();
  }
);
