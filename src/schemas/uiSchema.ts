import { type UiSchema } from '@rjsf/utils';

export const deploymentUiSchema: UiSchema = {
  'metadata': {
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter deployment name'
    },
    'namespace': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Namespace (default: default)'
    },
    'labels': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'spec': {
    'replicas': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Number of replicas'
    },
    'strategy': {
      'type': {
        'ui:widget': 'SelectWidget'
      },
      'rollingUpdate': {
        'maxSurge': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Max surge (e.g., 25%)'
        },
        'maxUnavailable': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Max unavailable (e.g., 25%)'
        }
      }
    },
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
        'restartPolicy': {
          'ui:widget': 'SelectWidget'
        },
        'containers': {
          'items': {
            'name': {
              'ui:widget': 'TextWidget',
              'ui:placeholder': 'Container name'
            },
            'image': {
              'ui:widget': 'TextWidget',
              'ui:placeholder': 'Container image'
            },
            'resources': {
              'requests': {
                'cpu': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'CPU request (e.g., 100m)'
                },
                'memory': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Memory request (e.g., 100Mi)'
                }
              },
              'limits': {
                'cpu': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'CPU limit (e.g., 100m)'
                },
                'memory': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Memory limit (e.g., 100Mi)'
                }
              }
            },
            'ports': {
              'items': {
                'containerPort': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Port number'
                },
                'name': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Port name'
                },
                'protocol': {
                  'ui:widget': 'SelectWidget'
                }
              }
            },
            'env': {
              'items': {
                'name': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Environment variable name'
                },
                'value': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Environment variable value'
                },
                'valueFrom': {
                  'configMapKeyRef': {
                    'name': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'ConfigMap name'
                    },
                    'key': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'ConfigMap key'
                    }
                  },
                  'secretKeyRef': {
                    'name': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'Secret name'
                    },
                    'key': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'Secret key'
                    }
                  }
                }
              }
            },
            'volumeMounts': {
              'items': {
                'name': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Volume name'
                },
                'mountPath': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Mount path'
                }
              }
            },
            'ui:options': {
              'label': false
            }
          }
        },
        'volumes': {
          'items': {
            'name': {
              'ui:widget': 'TextWidget',
              'ui:placeholder': 'Volume name'
            },
            'hostPath': {
              'path': {
                'ui:widget': 'TextWidget',
                'ui:placeholder': 'Host path'
              }
            },
            'configMap': {
              'name': {
                'ui:widget': 'TextWidget',
                'ui:placeholder': 'ConfigMap name'
              }
            },
            'secret': {
              'secretName': {
                'ui:widget': 'TextWidget',
                'ui:placeholder': 'Secret name'
              }
            }
          }
        }
      }
    }
  }
};

export const serviceUiSchema: UiSchema = {
  'metadata': {
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter service name (e.g., MYAPP)'
    },
    'namespace': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Namespace (default: default)'
    },
    'labels': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'spec': {
    'type': {
      'ui:widget': 'SelectWidget'
    },
    'selector': {
      'ui:widget': 'KeyValueWidget'
    },
    'sessionAffinity': {
      'ui:widget': 'SelectWidget'
    },
    'sessionAffinityConfig': {
      'ui:field': 'ConditionalField',
      'ui:condition': {
        'sessionAffinity': 'ClientIP'
      },
      'clientIP': {
        'timeoutSeconds': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Timeout seconds (default: 10800)'
        }
      }
    },
    'externalName': {
      'ui:field': 'ConditionalField',
      'ui:condition': {
        'type': 'ExternalName'
      },
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'External DNS name'
    },
    'ports': {
      'items': {
        'name': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Port name (e.g., MYAPP)'
        },
        'port': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Port number (required)'
        },
        'targetPort': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Target port (number or name)'
        },
        'protocol': {
          'ui:widget': 'SelectWidget'
        },
        'nodePort': {
          'ui:field': 'ConditionalField',
          'ui:condition': {
            '../type': 'NodePort'
          },
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Node port (30000-32767)'
        },
        'ui:options': {
          'label': false
        }
      }
    }
  }
};

export const statefulsetUiSchema: UiSchema = {
  'metadata': {
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter StatefulSet name (e.g., nginx)'
    },
    'namespace': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Namespace (default: default)'
    },
    'labels': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'spec': {
    'replicas': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Number of replicas (default: 3)'
    },
    'serviceName': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Service name (e.g., nginx)'
    },
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
        'terminationGracePeriodSeconds': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Termination grace period (seconds)'
        },
        'containers': {
          'items': {
            'name': {
              'ui:widget': 'TextWidget',
              'ui:placeholder': 'Container name (e.g., nginx)'
            },
            'image': {
              'ui:widget': 'TextWidget',
              'ui:placeholder': 'Container image (e.g., nginx-slim:1.16.1)'
            },
            'ports': {
              'items': {
                'containerPort': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Port number'
                },
                'name': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Port name (e.g., web)'
                },
                'protocol': {
                  'ui:widget': 'SelectWidget'
                }
              }
            },
            'volumeMounts': {
              'items': {
                'name': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Volume name'
                },
                'mountPath': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Mount path (e.g., /usr/share/nginx/html)'
                }
              }
            },
            'resources': {
              'requests': {
                'cpu': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'CPU request (e.g., 100m)'
                },
                'memory': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Memory request (e.g., 128Mi)'
                }
              },
              'limits': {
                'cpu': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'CPU limit (e.g., 500m)'
                },
                'memory': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Memory limit (e.g., 512Mi)'
                }
              }
            },
            'ui:options': {
              'label': false
            }
          }
        }
      }
    },
    'volumeClaimTemplates': {
      'items': {
        'metadata': {
          'name': {
            'ui:widget': 'TextWidget',
            'ui:placeholder': 'Volume claim name (e.g., www)'
          }
        },
        'spec': {
          'accessModes': {
            'ui:widget': 'MultiSelectWidget'
          },
          'storageClassName': {
            'ui:widget': 'TextWidget',
            'ui:placeholder': 'Storage class (e.g., my-storage-class)'
          },
          'resources': {
            'requests': {
              'storage': {
                'ui:widget': 'TextWidget',
                'ui:placeholder': 'Storage size (e.g., 1Gi)'
              }
            }
          }
        }
      }
    }
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
  'metadata': {
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter ConfigMap name'
    },
    'labels': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'data': {
    'ui:widget': 'KeyValueWidget'
  }
};

export const jobUiSchema: UiSchema = {
  'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
  'spec': {
    'template': {'spec': {'containers': {'items': {'ui:options': {'label': false}, 'ui:field': 'CardField'}}}}
  }
};

export const secretUiSchema: UiSchema = {
  'metadata': {
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter Secret name (e.g., testsecret-tls)'
    },
    'namespace': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Namespace (default: default)'
    },
    'labels': {
      'ui:widget': 'KeyValueWidget'
    },
    'annotations': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'type': {
    'ui:widget': 'SelectWidget',
    'ui:help': 'Select the type of secret to create'
  },
  'data': {
    'ui:widget': 'KeyValueWidget',
    'ui:help': 'Base64 encoded data. For TLS secrets, use keys: tls.crt and tls.key',
    'tls.crt': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded TLS certificate',
      'ui:options': {
        'rows': 4
      }
    },
    'tls.key': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded TLS private key',
      'ui:options': {
        'rows': 4
      }
    },
    'ca.crt': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded CA certificate',
      'ui:options': {
        'rows': 4
      }
    },
    '.dockerconfigjson': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded Docker config JSON',
      'ui:options': {
        'rows': 3
      }
    },
    'username': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Base64 encoded username'
    },
    'password': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Base64 encoded password'
    },
    'ssh-privatekey': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded SSH private key',
      'ui:options': {
        'rows': 4
      }
    },
    'ssh-publickey': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded SSH public key',
      'ui:options': {
        'rows': 2
      }
    },
    'token': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Base64 encoded service account token'
    }
  },
  'stringData': {
    'ui:widget': 'KeyValueWidget',
    'ui:help': 'Plain text data that will be automatically base64 encoded'
  }
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
  'metadata': {
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter Ingress name'
    },
    'namespace': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Namespace (default: default)'
    },
    'labels': {
      'ui:widget': 'KeyValueWidget'
    },
    'annotations': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'spec': {
    'ingressClassName': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Ingress class name (e.g., nginx)'
    },
    'defaultBackend': {
      'service': {
        'name': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Default service name'
        },
        'port': {
          'number': {
            'ui:widget': 'TextWidget',
            'ui:placeholder': 'Port number'
          },
          'name': {
            'ui:widget': 'TextWidget',
            'ui:placeholder': 'Port name'
          }
        }
      }
    },
    'rules': {
      'items': {
        'host': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Host domain (e.g., foo.bar.com)'
        },
        'http': {
          'paths': {
            'items': {
              'path': {
                'ui:widget': 'TextWidget',
                'ui:placeholder': 'Path (e.g., /)'
              },
              'pathType': {
                'ui:widget': 'SelectWidget'
              },
              'backend': {
                'service': {
                  'name': {
                    'ui:widget': 'TextWidget',
                    'ui:placeholder': 'Service name'
                  },
                  'port': {
                    'number': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'Port number (e.g., 80)'
                    },
                    'name': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'Port name'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    'tls': {
      'items': {
        'hosts': {
          'items': {
            'ui:widget': 'TextWidget',
            'ui:placeholder': 'Host domain'
          }
        },
        'secretName': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'TLS secret name'
        }
      }
    }
  }
};