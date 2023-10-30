/*
  =========================
  Таймер текущего времени
  =========================
*/
const
  ONEMINUTE=1000*60;

class Timer {
  #app=null;  // обеъкт App
  curDT;      // current time
  Visualizer=null;       // объект для визуализации времени
  secondsIntervalId=-1;  // id таймера
  prevH=-1;   // | предыдущие
  prevM=-1;   // | чвс и минута

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

    this.setVisualizer(visualizer);
    this.setTimer(this.#app.clkMode =='cmClock');
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
    Настраиваем тамер
  */
  setTimer(turnOn=true) {
    if (turnOn) {
      // устанавливаем ежесекундный таймер
      this.displayCurrentTime();   // сразу отображаем текущее время
      this.secondsIntervalId=setInterval(this.boundOneSecondsTimer,1000);
    } else {
      // отключаем таймер
      if (this.secondsIntervalId !=-1) clearInterval(this.secondsIntervalId);
      this.secondsIntervalId=-1;
    }
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
    this.curDT=new Date();

    if (!this.Visualizer) return;

    this.Visualizer.displaySeconds(this.curDT.getSeconds());

    if (this.curDT.getSeconds() ==0) {
      this.displayCurrentHM();
      // проверка будильника
      this.#app.checkAlarmTime(this.curDT.getHours(),this.curDT.getMinutes());
    }
  }

  /*
    Отображает часы и минуты
  */
  displayCurrentHM() {
    this.curDT=new Date();

    const
      H=this.curDT.getHours(),
      M=this.curDT.getMinutes();

    // корректирует фон
    this.#app.checkTimeOfDay(H,M);

    // время прописью
    if ((H !=this.prevH) || (M !=this.prevM)) this.Visualizer.displayTimeInWords(H,M);

    if (H !==this.prevH) {
      this.prevH=H;
      if (this.Visualizer)
        this.Visualizer.displayHours(H);
    }

    if (M !==this.prevM) {
      this.prevM=M;
      if (this.Visualizer)
        this.Visualizer.displayMinutes(M);
    }
  }

  /*
    Отображает полное время HH:MM:ss
  */
  displayCurrentTime() {
    this.displayCurrentHM();
    this.displayCurrentSeconds();
  }
}  /* --- class Timer --- */
