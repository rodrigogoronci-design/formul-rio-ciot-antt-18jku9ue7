migrate(
  (app) => {
    const requisicoes = new Collection({
      name: 'requisicoes_ciot',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: 'user_id = @request.auth.id',
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'id_operacao', type: 'text', required: true, max: 12 },
        { name: 'tipo_operacao', type: 'number', required: true },
        { name: 'cpf_cnpj_contratado', type: 'text' },
        { name: 'rntrc_contratado', type: 'text' },
        { name: 'cpf_cnpj_contratante', type: 'text' },
        { name: 'cpf_cnpj_destinatario', type: 'text' },
        { name: 'valor_frete', type: 'number' },
        { name: 'data_declaracao', type: 'date' },
        { name: 'data_inicio_viagem', type: 'date' },
        { name: 'data_fim_viagem', type: 'date' },
        { name: 'ambiente', type: 'text' },
        { name: 'status_requisicao', type: 'text' },
        { name: 'ciot_gerado', type: 'text' },
        { name: 'codigo_verificador', type: 'text' },
        { name: 'protocolo', type: 'text' },
        { name: 'mensagem_resposta', type: 'text' },
        { name: 'erro_detalhado', type: 'text' },
        { name: 'veiculos_json', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(requisicoes)

    const logs = new Collection({
      name: 'logs_requisicoes',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: 'user_id = @request.auth.id',
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'requisicao_id',
          type: 'relation',
          required: true,
          collectionId: requisicoes.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'tipo_log', type: 'text', required: true },
        { name: 'mensagem', type: 'text', required: true },
        { name: 'detalhes', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(logs)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('logs_requisicoes'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('requisicoes_ciot'))
    } catch (e) {}
  },
)
