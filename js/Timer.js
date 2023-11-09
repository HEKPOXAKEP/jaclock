/*
  =========================
  Таймер текущего времени
  =========================
*/
const
  ONEMINUTE=1000*60;

class Timer {
  #app=null;                  // обеъкт App
  curHMS;                     // current time in {h,m,s}
  Visualizer=null;            // объект для визуализации времени
  secondsIntervalId=-1;       // id посекундного таймера
  alarmModeIntervalId=-1;     // id таймера возвращения из режима установки будильника
  prevHMS={h:-1,m:-1,s:-1};   // предыдущие час, минута и секунда

  /*
    Конструктор
  */
  constructor(app,visualizer) {
    if (visualizer ==null) {
      throw 'Timer.constructor: Визуализатор не определён!';
      return null;
    }

    this.#app=app;

    // связываем обработчики таймеров с контекстом this класса
    this.boundOneSecondsTimer=this.oneSecondsTimer.bind(this);
    this.boundAlarmModeStop=this.alarmModeStop.bind(this);

    this.setVisualizer(visualizer);
    this.setTimer(this.#app.clkMode =='cmClock');
    if (this.#app.clkMode =='cmAlarm') this.resetAlarmTimer();
  }

  /*
    Устанавливаем визуализатор
  */
  setVisualizer(visualizer) {
    if (this.Visualizer ==visualizer)
      _info('Визуализатор',type(visualizer),'уже установлен.');
    else
      this.Visualizer=visualizer;
  }

  /*
    Устанавливаем таймер
  */
  setTimer(turnOn=true) {
    if (turnOn) {
      // устанавливаем ежесекундный таймер
      this.displayCurrentTime();   // сразу отображаем текущее время
      if (this.secondsIntervalId !=-1) clearInterval(this.secondsIntervalId);
      this.secondsIntervalId=setInterval(this.boundOneSecondsTimer,1000);
    } else {
      // отключаем таймер
      if (this.secondsIntervalId !=-1) clearInterval(this.secondsIntervalId);
      this.secondsIntervalId=-1;
    }
  }

  /*
    Сброс или остановка таймера выхода из режима установки будильника
  */
  resetAlarmTimer(stopIt=false) {
    if (this.alarmModeIntervalId !=-1) {
      clearInterval(this.alarmModeIntervalId);
      this.alarmModeIntervalId=-1;
    }
    if (stopIt) return;
    this.alarmModeIntervalId=setInterval(this.boundAlarmModeStop,ONEMINUTE);
  }

  /*
    Выход из режима установки будильника по минутному таймеру
  */
  alarmModeStop() {
    clearInterval(this.alarmModeIntervalId);
    this.alarmModeIntervalId=-1;
    this.Visualizer.toggleClockMode();
  }

  /*
    Обработчик secondsInterval
    Срабатывает каждую секунду
  */
  oneSecondsTimer() {
    this.displayCurrentSeconds();
  }

  /*
    Отображает секунды
  */
  displayCurrentSeconds() {
    const
      hms=time2HMS(new Date());

    if (hms.s ==this.curHMS.s)
      return;
    else
      this.curHMS.s=hms.s;

    if (!this.Visualizer) return;

    this.Visualizer.displaySeconds(hms);
    this.displayCurrentHM(hms);

    if (hms.s ==0) {
      // проверка будильника
      this.#app.checkAlarmTime(hms.h,hms.m);
    }
  }

  /*
    Отображает часы и минуты
  */
  displayCurrentHM(hms) {
    if (!hms)
      this.curHMS=time2HMS(new Date());
    else
      this.curHMS=hms;

    // корректирует фон
    this.#app.checkTimeOfDay(this.curHMS.h,this.curHMS.m);

    // время прописью
    if ((this.curHMS.h !=this.prevHMS.h) || (this.curHMS.m !=this.prevHMS.m))
      this.Visualizer.displayTimeInWords(this.curHMS.h,this.curHMS.m);

    if (this.curHMS.h !==this.prevHMS.h)
      this.prevHMS.h=this.curHMS.h;
    if (this.Visualizer)
      this.Visualizer.displayHours(this.curHMS);

    if (this.curHMS.m !==this.prevHMS.m)
      this.prevHMS.m=this.curHMS.m;
    if (this.Visualizer)
      this.Visualizer.displayMinutes(this.curHMS);
  }

  /*
    Отображает полное время HH:MM:ss
  */
  displayCurrentTime() {
    this.displayCurrentHM();
    this.displayCurrentSeconds();
  }
}  /* --- class Timer --- */
