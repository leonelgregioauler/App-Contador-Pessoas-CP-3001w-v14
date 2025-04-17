define(['axios'],
  function (Axios) {

    callGetService = async (itemControl, controller, dataType, retry) => {

      const date = new Date();
      let day = date.getDate();
      let month = date.getMonth() + 1;
      const year = date.toLocaleDateString('pt-br', {
        year : '2-digit'
      });
      let hour = date.getHours();
      let minutes = date.getMinutes().toString().padStart(2, '0');
      let diaSemana = date.getDay() + 1;

      let parameter = undefined;
      let url = undefined;

      day = day.toString().padStart(2, 0);
      month = month.toString().padStart(2, 0);
      hour = hour.toString().padStart(2, 0);
      minutes = minutes.toString().padStart(2, 0);

      // UTILIZAR PARA SALVAR / ATUALIZAR INFORMAÇÕES >>>
      if (dataType == 'ATUALIZAR_CONFIGURACAO_DISPOSITIVO') {

        const SSIDRoteador = itemControl.SSIDRoteador.replace('&', '%26');
        const subNet = itemControl.subNet ? itemControl.subNet : '255.255.255.0';
        
        url = `http://${itemControl.IP}/s?eEmail=${itemControl.eMail}&eData=${day}/${month}/${parseInt(year)}&eHora=${hour}:${parseInt(minutes)}&eMax=0&ssid=${SSIDRoteador}&epass=${itemControl.senhaRoteador}&eip=${itemControl.IP}&egate=${itemControl.gateWay}&emask=${subNet}&eNome=${itemControl.nomeEstabelecimento}&eRamo=${itemControl.ramoAtividade}&eAgora=0`;
      }

      if (dataType == 'ATUALIZAR_DATA_ROTEADOR') {

        parameter = `${controller.parameterUpdateDate}${day}${month}${year}${diaSemana}`;
        url = `http://${itemControl.IP}/${parameter}`;

      }

      if (dataType == 'ATUALIZAR_HORA_ROTEADOR') {

        parameter = `${controller.parameterUpdateHour}${hour}${minutes}`;
        url = `http://${itemControl.IP}/${parameter}`;

      }

      if (dataType == 'AJUSTAR_DIRECAO_SENSOR') {

        parameter = controller.parameterAdjustSensorDirection;
        url = `http://${itemControl.IP}/${parameter}`;

      }
      
      if (dataType == 'AJUSTAR_HORARIO_EXPEDIENTE') {
        
        /// TODO => AO FAZER O ASSISTENTE, DEVEMOS CONSULTAR DA CONTROLADORA O QUE ESTÁ CADASTRADO COMO HORA INÍCIO E FIM, PREENCHENDO OS CAMPOS AQUI.
        ///         ALÉM DISSO, PERMITIR ATUALIZAR, CASO NECESSÁRIO
        parameter = `${controller.parameterAdjustOfficeHours}${itemControl.horaInicioTurno1.toString().padStart(2, 0)}${itemControl.horaFimTurno2.toString().padStart(2, 0)}`;
        url = `http://${itemControl.IP}/${parameter}`;

      }

      // UTILIZAR PARA OBTER INFORMAÇÕES >>>
      if (itemControl.fonteDados == 'IP') {

        if (dataType == 'TOTAL') {
          parameter = controller.parameterTotal;
        } else if (dataType == 'SEMANA') {
          parameter = controller.parameterSem;
        } else if (dataType == 'MES') {
          parameter = controller.parameterMes;
        } else if (dataType == 'AVAILABLE_SSIDS') {
          parameter = controller.parameterAvailableSSIDs;
        } else if (dataType == 'CONFIGURACAO') {
          parameter = controller.parameterConfiguration;
        }

        const localFilePath = `${cordova.file.applicationDirectory}www/data/${parameter}.json`;

        (itemControl.IP != '8.8.8.8') ? url = `http://${itemControl.IP}/${parameter}` : url = `${localFilePath}`;
      }

      if (itemControl.fonteDados == 'URL') {

        if (dataType == 'TOTAL') {
          parameter = controller.parameterTotalCloud;
        } else if (dataType == 'SEMANA') {
          parameter = controller.parameterSemCloud;
        } else if (dataType == 'MES') {
          parameter = controller.parameterMesCloud;
        }

        url = `https://www.digitaq.com.br/cp3001w_alpha/relatorio.php?id=${itemControl.URL}&${parameter}`;
      }
      
      return new Promise((resolve, reject) => {

        if (!retry) {
          Axios.get(url)
            .then((data) => {
              (!data.data.items) ? resolve(data.data) : resolve(data.data.items[0]);
            })
            .catch((error) => {
              reject(error);
            })
        }

        if (retry) {

          let attempts = 0;
          const retryInterval = 1000;
          const maxAttempts = 5;
          const timeout = { timeout : 5000 };

          const tryToConnect = () => {
            Axios.get(url, timeout)
            .then((data) => {
              (!data.data.items) ? resolve(data.data) : resolve(data.data.items[0]);
            })
            .catch(error => {
              attempts++;
              if (attempts >= maxAttempts) {
                  reject(`Falha de comunicação após ${maxAttempts} tentativas`);
                  return;
              }
              setTimeout(tryToConnect, retryInterval);
            });
          }
          tryToConnect();
        }
      })
    }

    // TODAS AS VERSÕES, INCLUINDO ANDROID 13 OU SUPERIOR
    ReadWriteFilesDeviceMediaStore = async (stringData, fileName, subFolderName) => {

      const base64Data = btoa(stringData);
      const result = await cordova.plugins.safMediastore.writeFile({ "data": base64Data, "filename": fileName, "subFolder": `CP 3001/${subFolderName}` })
      return result;
    }

    // DEPRECIADO - FUNCIONA ATÉ ANDROID 12 - A PARTIR DO 13, SOMENTE GRAVA NAS PASTAS DO PROJETO
    ReadWriteFilesDevice = async (folderName, fileName, BlobData) => {
      // Diretório de Documentos
      const DIR_ENTRY = cordova.file.externalRootDirectory;

      return new Promise ((resolve, reject) => {

        window.resolveLocalFileSystemURL(DIR_ENTRY, function (dirEntry) {
          createDirectory(dirEntry);
        }, onErrorLoadFs);
  
        function createDirectory(rootDirEntry) {
          rootDirEntry.getDirectory('Documents', { create: true }, function (dirEntry) {
            dirEntry.getDirectory(folderName, { create: true }, function (subDirEntry) {
  
              createFile(subDirEntry, fileName);
  
            }, onErrorGetDir);
          }, onErrorGetDir);
        }
  
        function createFile(dirEntry, fileName) {
          dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
  
            writeFile(fileEntry, BlobData);
  
          }, onErrorCreateFile);
        }
  
        function writeFile(fileEntry, dataObj) {
          fileEntry.createWriter(function (fileWriter) {
  
            fileWriter.onwriteend = function () {
              console.log("Successful file write...");
              resolve('WRITE');
            };
  
            fileWriter.onerror = function (e) {
              console.log("Failed file write: " + e.toString());
              reject(e.toString());
            };
  
            fileWriter.write(dataObj);
          });
        }

        function onErrorLoadFs(onErrorLoadFs) {
          console.log('onErrorLoadFs: ' + onErrorLoadFs);
        }
  
        function onErrorGetDir(onErrorGetDir) {
          console.log('onErrorGetDir ' + onErrorGetDir);
        }
        
        function onErrorCreateFile(onErrorCreateFile) {
          console.log('onErrorCreateFile ' + onErrorCreateFile)
        }
      })
    }

    return {
      callGetService,
      ReadWriteFilesDeviceMediaStore,
      ReadWriteFilesDevice
    };
  });
