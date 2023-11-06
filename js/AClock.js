/*
  =========================
  Абстрактный класс часов
  =========================
*/
class AClock {
  tmpTime={h:-1,m:-1,s:0};  // хранит время будильника в процессе установки

  constructor() {
    this.tmpTime=strToHMobj(app.alarmTime);
  }

  /* Инициализация и переинициализация */
  reinit() {
    this.updateButtons();
    this.updateAlarmFlag();
    this.updateClockFace();
    this.setupEvents();
    if ((app.clkMode =='cmAlarm') && app.timer) app.timer.resetAlarmTimer();
  }

  /* Отображение/скрытие кнопок установки будильника */
  updateButtons() {}
  /* Отображение лампочки будильника */
  updateAlarmFlag() {}
  /* Обновление циферблата в зависимости от режима */
  updateClockFace() {}
  /* Переключение режима: время/установка будильника */
  toggleClockMode() {}

  /* Установка обработчиков событий */
  setupEvents() {}

  /* Отображение часов */
  displayHours(hms) {}
  /* Отображение минут */
  displayMinutes(hms) {}
  /* Отображение секунд */
  displaySeconds(hms) {}

  /* Отображение всех компонентов времени */
  displayTime(hms) {
    this.displayHours(hms.h);
    this.displayMinutes(hms.m);
    this.displaySeconds(hms.s);
  }

  /* Отображает время будильника */
  displayAlarmTime() {}

  /* Отображает время прописью */
  displayTimeInWords(h,m) {}
}
