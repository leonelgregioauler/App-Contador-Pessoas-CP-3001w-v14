define([],
function () {

    db = window.sqlitePlugin.openDatabase ({name: 'App-Contador-Pessoas.db', location: 'default'});
  
        function createDataBase () { 
            try {
                db.transaction(function(tx) {
                    tx.executeSql(`CREATE TABLE IF NOT EXISTS CONTROLADORAS ( idControladora INTEGER PRIMARY KEY AUTOINCREMENT, 
                                                                              descricaoControladora VARCHAR2(100) NOT NULL, 
                                                                              IP VARCHAR2(100) NULL,
                                                                              URL VARCHAR2(100) NULL,
                                                                              fonteDados VARCHAR2(200) NOT NULL,
                                                                              SSIDRoteador VARCHAR2(200) NULL,
                                                                              senhaRoteador VARCHAR2(200) NULL,
                                                                              eMail VARCHAR2(200) NULL,
                                                                              nomeEstabelecimento VARCHAR2(200) NULL,
                                                                              ramoAtividade VARCHAR2(200) NULL,
                                                                              horaInicioTurno1 INTEGER NOT NULL, 
                                                                              horaFimTurno1 INTEGER NOT NULL, 
                                                                              horaInicioTurno2 INTEGER NOT NULL, 
                                                                              horaFimTurno2 INTEGER NOT NULL, 
                                                                              exibeDashBoard NUMBER )`);
    
                    tx.executeSql(`CREATE TABLE IF NOT EXISTS RELATORIO_DIARIO ( hora INTEGER,
                                                                                 minuto INTEGER,
                                                                                 totalVisitantesHoraMinuto INTEGER,
                                                                                 constraint UK_HORA_MINUTO UNIQUE (hora, minuto) )`);

                    tx.executeSql(`CREATE TABLE IF NOT EXISTS RELATORIO_MENSAL ( mes INTEGER,
                                                                                 mesDescricao VARCHAR2(20), 
                                                                                 totalVisitantesMes INTEGER, 
                                                                                 ano INTEGER,
                                                                                 constraint UK_MES_ANO UNIQUE (mes, ano) )`);
    
                    tx.executeSql(`CREATE TABLE IF NOT EXISTS RELATORIO_MENSAL_DETALHES ( dia INTEGER,
                                                                                          totalVisitantesDia INTEGER,
                                                                                          mes INTEGER,
                                                                                          ano INTEGER,
                                                                                          constraint UK_DIA_MES_ANO UNIQUE (dia, mes, ano) ) `);
                    console.warn("Banco de Dados criado");

                    /* insertController({
                            "idControladora": 1,
                            "descricaoControladora": "Controladora Cliente MG - CP 3001w (cloud)",
                            "IP": "8.8.8.8",
                            "URL": "4363863",
                            "fonteDados": "URL",
                            "SSIDRoteador" : "",
                            "senhaRoteador" : "",
                            "horaInicioTurno1": 1,
                            "horaFimTurno1": 11,
                            "horaInicioTurno2": 15,
                            "horaFimTurno2": 22,
                            "exibeDashBoard": {}
                        }); */

                    /* insertController({
                            "idControladora": 1,
                            "descricaoControladora": "Controladora CP3001w",
                            "IP": "8.8.8.8",
                            "URL": "6746548",
                            "fonteDados": "URL",
                            "SSIDRoteador" : "",
                            "senhaRoteador" : "",
                            "eMail" : "digitaqeletronica@gmail.com",
                            "nomeEstabelecimento" : "Digitaq",
                            "ramoAtividade" : "Controladores Eletrônicos",
                            "horaInicioTurno1": 1,
                            "horaFimTurno1": 11,
                            "horaInicioTurno2": 15,
                            "horaFimTurno2": 22,
                            "exibeDashBoard": {}
                        }); */
                });
            } catch (err) {
                alert ('Erro ao criar tabelas '+ err);
            }
        }
  
        function dropDataBase ()  {
            try {
                console.log('Dropou a base de dados !!!');
                /* db.transaction(function(tx) {
                    tx.executeSql('DROP TABLE CONTROLADORAS');
                    tx.executeSql('DROP TABLE RELATORIO_DIARIO');
                    tx.executeSql('DROP TABLE RELATORIO_MENSAL');
                    tx.executeSql('DROP TABLE RELATORIO_MENSAL_DETALHES');
                }); */
            } catch (err) {
                alert ('Erro ao remover tabelas '+ err);
            }
        }
  
        function insertController (controller) {
            try {
                const exibeDashBoard = controller.exibeDashBoard ? 1 : 0; 
                
                db.transaction(function(tx) {
                    tx.executeSql(`INSERT OR REPLACE INTO CONTROLADORAS (descricaoControladora
                                                                       , IP
                                                                       , URL
                                                                       , fonteDados
                                                                       , SSIDRoteador
                                                                       , senhaRoteador
                                                                       , eMail
                                                                       , nomeEstabelecimento
                                                                       , ramoAtividade
                                                                       , horaInicioTurno1
                                                                       , horaFimTurno1
                                                                       , horaInicioTurno2
                                                                       , horaFimTurno2
                                                                       , exibeDashBoard) 
                                   VALUES (\'${controller.descricaoControladora}\'
                                         , \'${controller.IP}\'
                                         , \'${controller.URL}\'
                                         , \'${controller.fonteDados}\'
                                         , \'${controller.SSIDRoteador}\'
                                         , \'${controller.senhaRoteador}\'
                                         , \'${controller.eMail}\'
                                         , \'${controller.nomeEstabelecimento}\'
                                         , \'${controller.ramoAtividade}\'
                                           , ${controller.horaInicioTurno1}
                                           , ${controller.horaFimTurno1}
                                           , ${controller.horaInicioTurno2}
                                           , ${controller.horaFimTurno2}
                                           , ${exibeDashBoard})`
                    , []
                    , function(tx, result) {
                        if (exibeDashBoard == 1)
                            tx.executeSql(`UPDATE CONTROLADORAS SET exibeDashBoard = 0 WHERE idControladora != ${result.insertId}`);
                    }
                    , null);
                });
            } catch (err) {
                alert ('Erro ao cadastrar a controladora'+ err);
            }
        }
  
        function updateController (controller) {
            try {
                const exibeDashBoard = controller.exibeDashBoard ? 1 : 0; 
                
                db.transaction(function(tx) {
                    tx.executeSql(`UPDATE CONTROLADORAS
                                    SET descricaoControladora = \'${controller.descricaoControladora}\'
                                      , IP = \'${controller.IP}\'
                                      , URL = \'${controller.URL}\'
                                      , fonteDados = \'${controller.fonteDados}\'
                                      , SSIDRoteador = \'${controller.SSIDRoteador}\'
                                      , senhaRoteador = \'${controller.senhaRoteador}\'
                                      , eMail = \'${controller.eMail}\'
                                      , nomeEstabelecimento = \'${controller.nomeEstabelecimento}\'
                                      , ramoAtividade = \'${controller.ramoAtividade}\'
                                      , horaInicioTurno1 = ${controller.horaInicioTurno1}
                                      , horaFimTurno1 = ${controller.horaFimTurno1}
                                      , horaInicioTurno2 = ${controller.horaInicioTurno2}
                                      , horaFimTurno2 = ${controller.horaFimTurno2}
                                      , exibeDashBoard = ${exibeDashBoard} 
                                WHERE idControladora = ${controller.idControladora}`
                    , [], function(tx, result) {
                        if (exibeDashBoard == 1)
                            tx.executeSql(`UPDATE CONTROLADORAS SET exibeDashBoard = 0 WHERE idControladora != ${controller.idControladora}`);
                    }
                    , null);
                });
            } catch (err) {
                alert ('Erro ao cadastrar a controladora'+ err);
            }
        }
  
        function queryController (query) {
            var configuration = [];
            var configurationMap = [];
            try {
                return new Promise( (resolve, reject) => {
                    db.transaction(function(tx) {
                        tx.executeSql(query
                        , []
                        , function(tx, result) {
                            
                            for (let i = 0; i < result.rows.length; i++) {
                                configuration.push(result.rows.item(i));
                            }
    
                            configurationMap = configuration.map((item) => {
                                return {
                                    value: item.idControladora,
                                    label: item.descricaoControladora, 
                                    idControladora: item.idControladora,
                                    descricaoControladora: item.descricaoControladora,
                                    IP: item.IP,
                                    URL: item.URL,
                                    fonteDados: item.fonteDados,
                                    SSIDRoteador: item.SSIDRoteador,
                                    senhaRoteador: item.senhaRoteador,
                                    eMail: item.eMail,
                                    nomeEstabelecimento: item.nomeEstabelecimento,
                                    ramoAtividade: item.ramoAtividade,
                                    horaInicioTurno1: item.horaInicioTurno1,
                                    horaFimTurno1: item.horaFimTurno1,
                                    horaInicioTurno2: item.horaInicioTurno2,
                                    horaFimTurno2: item.horaFimTurno2, 
                                    exibeDashBoard: item.exibeDashBoard === 1 ? true : false
                                }
                            })
                            resolve(configurationMap);
                        }
                        , function(tx, error) {
                            resolve([]);
                        })
                    })
                });
            } catch (err) {
                alert ('Erro ao consultar a controladora ' + err);
            }
            return configuration;
        }
  
        function deleteController (idControladora) {
            try {
                db.transaction(function(tx) {
                    tx.executeSql(`DELETE FROM CONTROLADORAS WHERE idControladora = ${idControladora}`);
                });
            } catch (err) {
                alert ('Erro ao remover a controladora '+ err);
            }
        }

        function insertUpdateVisitorsDayDetails (hour, historicDay, minute, fullDate) {
  
            try {
                const parameterDate = localStorage.getItem("DATE");

                if ( (historicDay.h > 0) && (parameterDate !== fullDate) ) {
                    localStorage.setItem("DATE", fullDate);
                    db.transaction(function(tx) {
                        tx.executeSql(`DELETE FROM RELATORIO_DIARIO`);
                    });
                }
                if ((hour == historicDay.h) && (minute !== 0)) {
                    db.transaction(function(tx) {
                        tx.executeSql(`INSERT OR REPLACE INTO RELATORIO_DIARIO (hora, minuto, totalVisitantesHoraMinuto) 
                                        VALUES (${historicDay.h}, ${minute}, ${parseInt(historicDay.v)})`);
                    });
                }
            } catch (err) {
                alert ('Erro ao inserir ou atualizar o total de visitantes por hora detalhado '+ err);
            }
        }

        function queryVisitorsDayDetails (query) {
            var visitors = [];
            var visitorsMap = [];
            try {
                return new Promise( (resolve, reject) => {
                    db.transaction(function(tx) {
                        tx.executeSql(query
                        , []
                        , function(tx, result) {
                            
                            for (let i = 0; i < result.rows.length; i++) {
                                visitors.push(result.rows.item(i));
                            }

                            visitorsMap = visitors.map((item) => {
                                return {
                                    d: null,
                                    h: parseInt(item.hora),
                                    m: item.minuto,
                                    v: item.totalVisitantesHoraMinuto.toString()
                                }
                            })
                            
                            resolve(visitorsMap);
                        }
                        , reject)
                    })
                });
            } catch (err) {
                alert ('Erro ao consultar os dados mensais de visitantes ' + err);
            }
            return visitors;
        }
  
        function insertUpdateVisitorsMonth (month, totalVisitantesMes, year) {
            try {
                db.transaction(function(tx) {
                    tx.executeSql(`INSERT OR REPLACE 
                                   INTO RELATORIO_MENSAL (mes, mesDescricao, totalVisitantesMes, ano) 
                                   VALUES (${month.mes}
                                       , \'${month.mesDescricao}\'
                                         , ${totalVisitantesMes}
                                         , ${year})`);
                });
            } catch (err) {
                alert ('Erro ao inserir ou atualizar visitantes '+ err);
            }
        }
  
        function queryVisitorsMonth (query) {
            var visitors = [];
            var visitorsMap = [];
            try {
                return new Promise( (resolve, reject) => {
                    db.transaction(function(tx) {
                        tx.executeSql(query
                        , []
                        , function(tx, result) {
                            
                            for (let i = 0; i < result.rows.length; i++) {
                                visitors.push(result.rows.item(i));
                            }
    
                            visitorsMap = visitors.map((item) => {
                                return {
                                    mes: item.mes,
                                    mesDescricao: item.mesDescricao,
                                    totalVisitantesMes: item.totalVisitantesMes,
                                    ano: item.ano
                                }
                            })
                            
                            resolve(visitorsMap);
                        }
                        , reject)
                    })
                });
            } catch (err) {
                alert ('Erro ao consultar os dados mensais de visitantes ' + err);
            }
            return visitors;
        }
  
        function insertUpdateVisitorsMonthDetails (historicMonth, month, year) {
    
            try {
                db.transaction(function(tx) {
                    tx.executeSql(`INSERT OR REPLACE INTO RELATORIO_MENSAL_DETALHES (dia, totalVisitantesDia, mes, ano) 
                                    VALUES (${historicMonth.d}, ${parseInt(historicMonth.v)}, ${month.mes}, ${year})`);
                });
            } catch (err) {
                alert ('Erro ao inserir ou atualizar o total de visitantes detalhado '+ err);
            }
        }
  
        function queryVisitorsMonthDetails (query) {
            var visitors = [];
            var visitorsMap = [];
            try {
                return new Promise( (resolve, reject) => {
                    db.transaction(function(tx) {
                        tx.executeSql(query
                        , []
                        , function(tx, result) {
                            
                            for (let i = 0; i < result.rows.length; i++) {
                                visitors.push(result.rows.item(i));
                            }
    
                            visitorsMap = visitors.map((item) => {
                                return {
                                    dia: parseInt(item.dia),
                                    totalVisitantesDia: item.totalVisitantesDia,
                                    mes: item.mes,
                                    mesDescricao: item.mesDescricao,
                                    ano: item.ano
                                }
                            })
                            
                            resolve(visitorsMap);
                        }
                        , reject)
                    })
                });
            } catch (err) {
                alert ('Erro ao consultar os dados mensais de visitantes ' + err);
            }
            return visitors;
        }
  
        return { 
            createDataBase: createDataBase,
            dropDataBase: dropDataBase,
            insertController: insertController,
            updateController: updateController,
            queryController: queryController,
            deleteController: deleteController,
            insertUpdateVisitorsDayDetails: insertUpdateVisitorsDayDetails,
            queryVisitorsDayDetails: queryVisitorsDayDetails,
            insertUpdateVisitorsMonth: insertUpdateVisitorsMonth,
            queryVisitorsMonth: queryVisitorsMonth,
            insertUpdateVisitorsMonthDetails: insertUpdateVisitorsMonthDetails,
            queryVisitorsMonthDetails: queryVisitorsMonthDetails
        };
    }
);
