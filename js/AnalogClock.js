/*
  =======================================
  Класс для отображения Аналоговых часов
  =======================================
*/
class AnalogClock extends AClock {

  constructor() {
    super();
    this.reinit();
  }


}

/*
  Регистрируем класс визуализатора Аналоговых часов.
*/
registerClockClass('clkAnalog',AnalogClock);
