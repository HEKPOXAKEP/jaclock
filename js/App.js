/*
  ===================
  Application class
  ===================
*/
const
  // файл звука будикльника
  ALARM_SOUND_SRC='data/elektronnoe-koltso-budilnika-dlya-traditsionnogo-elektronnogo-budilnika-40439.mp3';

const
  // тип часов по умолчанию
  DefaultClockType='clkDigital',
  // параметры разных типов часов
  ClockTypes={
    clkDigital:{
      name:'ЦИФРОВЫЕ ЧАСЫ',
      css:'DigitalClock.css',
      html:'DigitalClock.html',
      js:'DigitalClock.js',
    },
    clkAnalog:{
      name:'АНАЛОГОВЫЕ ЧАСЫ СО СТРЕЛКАМИ',
      css:'AnalogClock.css',
      html:'AnalogClock.html',
      js:'AnalogClock.js',
    }
  }

const
  // типы анимации фона
  BgAnimationTypes={
    BA_LINEAR:1,
    BA_RADIAL:2,
  },
  // данные для анимации фона по времени суток
  TimesOfDay=[
    { name: 'Утро',
      text: 'утра',                             // e.g. семь часов _утра_
      aniType: BgAnimationTypes.BA_LINEAR,      // тип анимации фона
      intervals: [{l:6,r:12}],                  // интервал в часах: 6..12
      bgColors: ['navy','#dcf0f4','yellow'],    // цвета для градиента фона
      bgStartPerc: 90,                          // начальный процент отображения первого (верхнего) цвета фона
      bgEndPerc: 1,                             // конечный процент отображения первого цвета фона
    },   
    { name: 'День',
      text: 'дня',
      aniType: BgAnimationTypes.BA_RADIAL,
      intervals: [{l:12,r:18}],
      bgColors: ['yellow','white','#93e0f9'],
      bgStartPerc: 30,
      bgEndPerc: 30,
    },   
    { name: 'Вечер',
      text: 'вечера',
      aniType: BgAnimationTypes.BA_LINEAR,
      intervals: [{l:18,r:24}],
      bgColors: ['navy','#f4d00c','#ef5300'],
      bgStartPerc: 1,
      bgEndPerc: 90,
    },   
    { name: 'Ночь',
      text: 'ночи',
      aniType: BgAnimationTypes.BA_RADIAL,
      intervals: [{l:0,r:6}],
      bgColors: ['silver','#186cd6','#053079'],
      bgStartPerc: 30,
      bgEndPerc: 30,
    },   
  ];

/*
  Регистрация класса в ClockType
*/
function registerClockClass(clkType,className) {
  ClockTypes[clkType].className=className;
}

/*
  Главный класс приложения
*/
class App
{
  clkType='';               // тип часов: clkDigital || clkAnalog
  versionInfo={};           // инфа о продукте, грузится из VersionInfo.json
  timer=null;               // объект таймера
  clkVisualObj=null;        // текущий объект визуализации в зависимости от this.clkType
  clkMode='';               // текущий режим часов: cmClock || cmAlarm: часы || установка будильника
  alarmOn=false;            // индикатор будильника
  alarmTime='00:00';        // время будильника
  bgPerc=0;                 // предыдущие проценты для фона
  alarmSound=new Audio();   // объект воспроизведения звука будильника

  /*
    Lets construct the object now!
  */
  constructor() {
    this.initializeGlobals();
    this.loadVersionInfo();
    this.setClockType();
    this.setupEvents();
  }

  /*
    Настройка событий
  */
  setupEvents() {
    this.boundClockTypeClick=this.clockTypeClick.bind(this);
    this.boundKeydown=this.keyDown.bind(this);   // для остановки будильника по пробелу

    window.addEventListener('keydown',this.boundKeydown);
    document.getElementById('clock-type-title').addEventListener('click',this.boundClockTypeClick);
  }

  /*
    Переключает тип часов Аналоговые/Цифровыи и загружает соответствующий модуль
  */
  setClockType(ct) {
    if (ct) {
      if (this.clkType ==ct) return;

      this.clkType=ct;
      setCookie('clk-type',ct);
    }

    document.getElementById('clock-type-title').innerHTML=ClockTypes[this.clkType].name;

    if (this.timer) this.timer.setTimer(false);

    // загрузка и инициализация модуля XxxClock
    new Promise((resolve,reject) => {
      var rez=this.loadClockMod();

      if (rez.error) {
        reject(rez.message);
      } else {
        resolve(rez);
      }
    })
    .then((response) => {
      ///_log(response.message);  // dbg
      if (this.clkVisualObj !=null) this.clkVisualObj=null;
      this.clkVisualObj=new ClockTypes[this.clkType]['className']();

      if (this.timer ==null)
        this.timer=new Timer(this,this.clkVisualObj);
      else
        this.timer.setVisualizer(this.clkVisualObj);

      this.timer.setTimer(this.clkMode =='cmClock');
    })
    .catch((err) => {
      //_err(`Метод App.loadClockMod() завершился с ошибкой:\n${err.message}`);
      _err('Метод App.loadClockMod() завершился с ошибкой:\n',err);
    });
  }

  /*
    Инициализиция глобальных параметров
  */
  initializeGlobals() {
    // время суток
    var dt=new Date();
    this.checkTimeOfDay(dt.getHours(),dt.getMinutes());

    // тип часов
    this.clkType=getCookie('clk-type');
    if (!this.clkType) {
      this.clkType=DefaultClockType;
      setCookie('clk-type',DefaultClockType);
    }

    // режим часов
    this.clkMode=getCookie('clk-mode');
    if (!this.clkMode) {
      this.setClockMode('cmClock');
    }

    // время будильника
    this.alarmTime=getCookie('alarm-time');
    if (!this.alarmTime || (this.alarmTime =='undefined')) {
      this.setAlarmTime('19:17');
    }

    // индикатор будильника
    this.alarmOn=getCookie('alarm-on');
    if (this.alarmOn ==null) {
      this.alarmOn=false;
      setCookie('alarm-on','false');
    } else {
      this.alarmOn=this.alarmOn.toLowerCase() =='true';
    }

    // параметры сигнала будильника
    this.alarmSound.loop=true;
    this.boundPlayAlarmSound=this.playAlarmSound.bind(this);
  }

  /*
    Грузим информацию о продукте из VersionInfo.json
  */
  loadVersionInfo() {
    fetch('VersionInfo.json')
    .then((response) => {
      if (response.ok)
        return response.json();

      return Promise.reject(`Ошибка загрузки VersionInfo.json: ${response.status} ${response.statusText}`);
    })
    .then((json) => {
      this.versionInfo=json;
      document.title=json.PID;
    })
    .catch((error) => {
      console.error(error);
    });
  }
  
  /*
    Загружает компонеты модуля Часов для текущего режима App.clkType.
    Вернёт Promise. Подробности см. в ls-www-lib/mod-control.js.
  */
  loadClockMod() {
    return modCtrl.loadMod(
      this.clkType,
      {
        oCss: {href: 'css/'+ClockTypes[this.clkType].css},
        oHtml: {url: 'html/'+ClockTypes[this.clkType].html, parentId: 'theClock'},
        oJs: {src: 'js/'+ClockTypes[this.clkType].js},
      });
  }

  /*
    Запоминает режим Часы/Установка будильника
  */
  setClockMode(cm) {
    this.clkMode=cm;
    setCookie('clk-mode',this.clkMode);
  }

  /*
    Устанавливает время будильника.
    tm может быть либо в виде 'hh:mm', либо в виде {h,m}
  */
  setAlarmTime(tm) {
    if (typeof tm =='string') {
      this.alarmTime=tm;
    } else {
      this.alarmTime=hmObjToStr(tm);
    }
    setCookie('alarm-time',this.alarmTime);
  }

  /*
    Установка фона в зависимости от времени суток
  */
  checkTimeOfDay(h,m) {
    // ищем, в какой интервал попадает текущее время
    for (var i=0; i <TimesOfDay.length; i++) {
      if (numInIntervals(h,TimesOfDay[i].intervals)) {
        switch (TimesOfDay[i].aniType) {
          case BgAnimationTypes.BA_LINEAR:
            this.doAnimateLinearBg(i,h,m);
            break;
          case BgAnimationTypes.BA_RADIAL:
            this.doAnimateRadialBg(i,h,m);
            break;
          default:
            _warn('Непонятный тип анимации: ',TimesOfDay[i].aniType);
        }
        return true;
      } /*IF curtime in interval*/
    }
  }

  /*
    Анимация линейного фона
  */
  doAnimateLinearBg(i,h,m) {
    var
      perc=-1,
      mins=0,                                 // к-во минут от начала интервала
      newStyle='';                            // new body.style

    if (TimesOfDay[i].bgStartPerc ==TimesOfDay[i].bgEndPerc) {
      newStyle=TimesOfDay[i].bgColors.toString();
    } else {
      mins=(h-TimesOfDay[i].intervals[0].l)*60+m;

      if (TimesOfDay[i].bgStartPerc <TimesOfDay[i].bgEndPerc) {
        // в сторону увеличения %
        perc=TimesOfDay[i].bgStartPerc+Math.trunc(mins/(360/(TimesOfDay[i].bgEndPerc-TimesOfDay[i].bgStartPerc)));
        perc=perc >TimesOfDay[i].bgEndPerc ? TimesOfDay[i].bgEndPerc : perc;
      } else {
        // в сторону уменьшения %
        perc=TimesOfDay[i].bgStartPerc-Math.trunc(mins/(360/(TimesOfDay[i].bgStartPerc-TimesOfDay[i].bgEndPerc)));
        perc=perc <TimesOfDay[i].bgEndPerc ? TimesOfDay[i].bgEndPerc : perc;
      }

      newStyle=TimesOfDay[i].bgColors[0]+' '+perc+'%,'+TimesOfDay[i].bgColors.slice(1).toString();
    }

    newStyle='background-image: linear-gradient('+newStyle+');';

    if (this.bgPerc !==perc) {
      this.bgPerc=perc;
      document.body.style.cssText=newStyle;
    }
  }

  /*
    Анимация радиального фона
  */
  doAnimateRadialBg(i,h,m) {
    var
      mins=(h-TimesOfDay[i].intervals[0].l)*60+m,   // к-во минут от начала интервала
      perc=Math.trunc((mins*100)/360);           // положение солнца по горизонтали в %

    perc=perc >100 ? 100 : perc;

    if (this.bgPerc !==perc) {
      this.bgPerc=perc;
      document.body.style.cssText='background-image: radial-gradient(circle at '+perc+'% 140px,'+
        TimesOfDay[i].bgColors[0]+' 32px,'+
        TimesOfDay[i].bgColors[1]+' 48px,'+
        TimesOfDay[i].bgColors[2]+')';
    }
  }

  /*
    Обработчик события alarmSound.oncanplaythrough -
    запускает проигрывание звука будильника, когда файл прогрузился
  */
  playAlarmSound(ev) {
    this.alarmSound.removeEventListener('canplaythrough',this.boundPlayAlarmSound,true);
    this.alarmSound.play();
  }

  /*
    Выключает звук будильника
  */
  stopAlarmSound() {
    this.alarmSound.pause();
    this.alarmSound.currentTime=0;
  }

  /*
    Проверяет время (h,m) и включает или отключает звук будильника
  */
  checkAlarmTime(h,m) {
    if (!this.alarmOn) return;   // будильник выключен

    var
      hm=hmObjToStr({h:h,m:m});

    if (hm ==this.alarmTime) {
      // время будить!
      if (this.alarmSound.src =='') {
        this.alarmSound.addEventListener('canplaythrough',this.boundPlayAlarmSound,true);
        this.alarmSound.src=ALARM_SOUND_SRC;
      } else if (this.alarmSound.paused) {
        this.playAlarmSound(null);
      }
    } else {
      // выключим звук, если он включён
      this.stopAlarmSound();
    }
  }

  keyDown(ev) {
    // ловим только [пробел]
    if (ev.key !=' ') return;

    if (!this.alarmSound.paused) this.stopAlarmSound();
    this.clkVisualObj.alarmOnOff();
  }

  /*
    Клик по заголовку для смены типа чсов
  */
  clockTypeClick(ev) {
    //this.clkType=(this.clkType =='clkDigital') ? 'clkAnalog' : 'clkDigital';
    this.setClockType((this.clkType =='clkDigital') ? 'clkAnalog' : 'clkDigital');
  }

} /* the end of the class App */
