export enum FrequencyType {
    OneTime = "Única ocasión",
    SameWeekDayRepeatForWeeks = "Recurrente: Mismo día de la semana cada N semanas",
    StartEndDayRepeatMonths = "Recurrente: Inicio o fin de mes cada N meses",
    StartEndDaySelectedMonths = "Recurrente: Inicio o fin de mes en meses selectos",
    SameDayRepeatMonths = "Recurrente: Mismo día del mes, cada N meses",
    SameDaySelectedMonths = "Recurrente: Mismo día del mes en meses selectos",
}

export enum Month {
  Enero = "Enero",
  Febrero = "Febrero",
  Marzo = "Marzo",
  Abril = "Abril",
  Mayo = "Mayo",
  Junio = "Junio",
  Julio = "Julio",
  Agosto = "Agosto",
  Septiembre = "Septiembre",
  Octubre = "Octubre",
  Noviembre = "Noviembre",
  Diciembre = "Diciembre",
}

export enum DayOfTheWeek {
  Domingo = "Domingo",
  Lunes = "Lunes",
  Martes = "Martes",
  Miercoles = "Miercoles",
  Jueves = "Jueves",
  Viernes = "Viernes",
  Sabado = "Sabado",
}

export const MONTHS = [
  Month.Enero,
  Month.Febrero,
  Month.Marzo,
  Month.Abril,
  Month.Mayo,
  Month.Junio,
  Month.Julio,
  Month.Agosto,
  Month.Septiembre,
  Month.Octubre,
  Month.Noviembre,
  Month.Diciembre,
];

export const DAYS_OF_THE_WEEK = [
  DayOfTheWeek.Domingo,
  DayOfTheWeek.Lunes,
  DayOfTheWeek.Martes,
  DayOfTheWeek.Miercoles,
  DayOfTheWeek.Jueves,
  DayOfTheWeek.Viernes,
  DayOfTheWeek.Sabado,
];
