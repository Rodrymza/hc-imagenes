export interface INotificacionesConfig {
  ENVIOS_DESACTIVADOS: boolean;
  HORA_INICIO: number;
  HORA_FIN: number;
  EXCLUIR_TERAPIAS: boolean;
  DIAS_PERMITIDOS: number[];
}

const defaults: INotificacionesConfig = {
  ENVIOS_DESACTIVADOS: false,
  HORA_INICIO: 8,
  HORA_FIN: 14,
  EXCLUIR_TERAPIAS: false,
  DIAS_PERMITIDOS: [1, 2, 3, 4, 5],
};

let config: INotificacionesConfig = { ...defaults };

export const getConfigNotificaciones = (): INotificacionesConfig => ({
  ...config,
});

export const updateConfigNotificaciones = (
  partial: Partial<INotificacionesConfig>,
): INotificacionesConfig => {
  config = { ...config, ...partial };
  return getConfigNotificaciones();
};
