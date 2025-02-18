import { Plugin } from 'xgplayer'
const { POSITIONS } = Plugin
import fastSvg from '@/assets/fast.svg';
export default class FastPlugin extends Plugin  {
  
  /**
   * （必须声明）插件的名称，将作为插件实例的唯一key值
   * 该参数还最为播放器上该插件的配置透传key值，例如：
   * 在插件afterCreate之后可以通过this.config.text获取到改配置参数
   **/
  static get pluginName() {
    return 'fastPlugin'
  }

  static get defaultConfig () {
    return {
       text: '前进10秒',
       position: POSITIONS.CONTROLS_LEFT
    }
  }

  constructor (args) {
    super(args)
  }

  afterPlayerInit () {
    // TODO 播放器调用start初始化播放源之后的逻辑
  }

  afterCreate () {
    // 对当前插件根节点内部类名为.icon的元素绑定click事件
    this.bind('.xgplayer-fast', 'click', this.handleFastClick)
     // 获取插件渲染的DOM元素
     const fastButton = this.find('.xgplayer-fast');
     if (fastButton) {
       // 添加点击事件
       fastButton.addEventListener('click', this.handleFastClick);
     }
  }

  destroy () {
    // 播放器销毁的时候一些逻辑
  }

  render () {
    return `
      <xg-icon class="xgplayer-fast" data-index="1">
        <div class="xgplayer-icon">
          <img src="${fastSvg}" alt="fast" />
        </div>
      </xg-icon>
    `;
  }

   /**
   * 处理快进按钮点击事件
   */
   handleFastClick = () => {
    // 获取当前播放时间
    const currentTime = this.player.currentTime;
    // 快进10秒
    this.player.seek(currentTime + 10);
  }
}