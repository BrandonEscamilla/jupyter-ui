import { JupyterLab, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { JupyterFrontEnd, LabShell, ILabShell } from '@jupyterlab/application';
import { PageConfig } from '@jupyterlab/coreutils';
// import { Widget } from '@lumino/widgets';
import { JupyterLabAppProps } from "./JupyterLabApp";

// The webpack public path needs to be set before loading the CSS assets.
(global as any).__webpack_public_path__ = PageConfig.getOption('fullStaticUrl') + '/';
// const styles = import('./AppCss' as any) as Promise<any>;
import('./JupyterLabAppCss') as Promise<any>;
/*
interface IHeadLessLabShell extends ILabShell {
//  set currentWidget(widget: Widget | null);
}

class HeadlessLabShell extends LabShell implements IHeadLessLabShell {
  private _currentWidget: Widget | null;
  constructor(options?: ILabShell.IOptions) {
    super(options);
  }
  get currentWidget() {
    return this._currentWidget;
  }
  set currentWidget(widget: Widget | null) {
    this._currentWidget = widget;
  }
}
*/
class HeadLessJupyterLab extends JupyterLab implements JupyterFrontEnd<ILabShell> {
  constructor(options?: JupyterLab.IOptions) {
    super(options);
  }
}

export class JupyterLabAppAdapter {
  private _props: JupyterLabAppProps;
  private _jupyterlab: HeadLessJupyterLab;
  private _shell: LabShell;
  private _plugins: Map<string, JupyterFrontEndPlugin<any, any, any> & {
    service: any;
  }>;
  private _ready: Promise<void>;
  private _readyResolve: () => void;

  constructor(props: JupyterLabAppProps) {
    this._ready = new Promise((resolve, _) => {
      this._readyResolve = resolve;
    });
    this.loadApp(props);
  }

  async loadApp(props: JupyterLabAppProps) {
    this._props = props;
    const { hostId, extensions, mimeExtensions, extensionPromises, mimeExtensionPromises, devMode, headless, serviceManager } = props;
//    await styles;
    const mimeExtensionResolved = await Promise.all(mimeExtensionPromises);
    mimeExtensions.push(...mimeExtensionResolved);
    this._shell = new LabShell();
    this._jupyterlab = new HeadLessJupyterLab({
      shell: this._shell,
      mimeExtensions,
      devMode,
      serviceManager,
      disabled: {
        patterns: [],
        matches: [],
      },
      deferred: {
        patterns: [],
        matches: [],
      },
    });
    const extensionResolved = await Promise.all(extensionPromises);
    extensions.push(...extensionResolved);
    this._jupyterlab.registerPluginModules(extensions);
    if (headless) {
      this._jupyterlab.deregisterPlugin('@jupyterlab/apputils-extension:splash', true);
    }
    this._jupyterlab.start({
      hostID: hostId,
      startPlugins: [],
      ignorePlugins: [],
    });
    this._jupyterlab.restored.then(() => {
      this._plugins = (this._jupyterlab as any)['_plugins'];
      this._readyResolve();
    });
  }

  get jupyterlab() {
    return this._jupyterlab;
  }

  get shell() {
    return this._shell;
  }

  get docRegistry() {
    return this._jupyterlab.docRegistry;
  }

  get commands() {
    return this._jupyterlab.commands;
  }

  get info() {
    return this._jupyterlab.info;
  }

  get mimeExtensions() {
    return this._jupyterlab.info.mimeExtensions;
  }

  get contextMenu() {
    return this._jupyterlab.contextMenu;
  }

  get path() {
    return this._jupyterlab.paths;
  }

  get plugins() {
    return this._plugins;
  }

  get ready() {
    return this._ready;
  }

  get props() {
    return this._props;
  }

  plugin(id: string) {
    return this._plugins.get(id);
  }

  service(id: string) {
    return this._plugins.get(id)?.service;
  }

}

export default JupyterLabAppAdapter;
