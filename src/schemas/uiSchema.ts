import { UiSchema } from '@rjsf/utils';

export const deploymentUiSchema: UiSchema = {
  'metadata': {
    'labels': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'spec': {
    'selector': {
      'matchLabels': {
        'ui:widget': 'KeyValueWidget'
      }
    },
    'template': {
      'metadata': {
        'labels': {
          'ui:widget': 'KeyValueWidget'
        }
      },
      'spec': {
        'containers': {
          'items': {
            'ui:options': {
              'label': false
            },
            'ui:field': 'CardField'
          }
        }
      }
    }
  }
};

export const serviceUiSchema: UiSchema = {
  'metadata': {
    'labels': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'spec': {
    'selector': {
      'ui:widget': 'KeyValueWidget'
    },
    'ports': {
      'items': {
        'ui:options': {
          'label': false
        },
        'ui:field': 'CardField'
      }
    }
  }
};

export const statefulsetUiSchema: UiSchema = {
  'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
  'spec': {
    'selector': {'matchLabels': {'ui:widget': 'KeyValueWidget'}},
    'template': {
      'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
      'spec': {'containers': {'items': {'ui:options': {'label': false}, 'ui:field': 'CardField'}}}
    },
    'volumeClaimTemplates': {'items': {'ui:field': 'CardField'}}
  }
};

export const daemonsetUiSchema: UiSchema = {
  'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
  'spec': {
    'selector': {'matchLabels': {'ui:widget': 'KeyValueWidget'}},
    'template': {
      'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
      'spec': {'containers': {'items': {'ui:options': {'label': false}, 'ui:field': 'CardField'}}}
    }
  }
};

export const configmapUiSchema: UiSchema = {
  'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
  'data': {'ui:widget': 'KeyValueWidget'}
};

export const jobUiSchema: UiSchema = {
  'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
  'spec': {
    'template': {'spec': {'containers': {'items': {'ui:options': {'label': false}, 'ui:field': 'CardField'}}}}
  }
};

export const secretUiSchema: UiSchema = {
  'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
  'data': {'ui:widget': 'KeyValueWidget'}
};

export const cronjobUiSchema: UiSchema = {
  'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
  'spec': {
    'jobTemplate': {
      'spec': {
        'template': {'spec': {'containers': {'items': {'ui:options': {'label': false}, 'ui:field': 'CardField'}}}}
      }
    }
  }
};

export const ingressUiSchema: UiSchema = {
  'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
  'spec': {
    'rules': {'items': {'ui:field': 'CardField', 'http': {'paths': {'items': {'ui:field': 'CardField'}}}}},
    'tls': {'items': {'ui:field': 'CardField'}}
  }
};