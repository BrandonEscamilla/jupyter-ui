from typing import Any, Dict, List

import os
import json

from jupyterlab_server import LabServerApp
from jupyter_server.base.handlers import JupyterHandler
from jupyter_server.extension.handler import ExtensionHandlerMixin, ExtensionHandlerJinjaMixin
from jupyter_server.utils import url_path_join as ujoin


HERE = os.path.dirname(__file__)


with open(os.path.join(HERE, './../package.json')) as fid:
    version = json.load(fid)['version']


def _jupyter_server_extension_points() -> List[Dict[str, Any]]:
    return [
        {
            'module': __name__,
            'app': SimpleApp
        }
    ]


class SimpleHandler(
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin,
    JupyterHandler
    ):
    """
    Serve a notebook file from the filesystem in the notebook interface
    """

    def get(self):
        """Get the main page for the application's interface."""
        # Options set here can be read with PageConfig.getOption
        mathjax_config = self.settings.get('mathjax_config', 'TeX-AMS_HTML-full,Safe')
        mathjax_url = self.settings.get('mathjax_url', 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js')

        config_data = {
            # Use camelCase here, since that's what the lab components expect
            'baseUrl': self.base_url,
            'token': self.settings['token'],
            'notebookPath': 'ping.ipynb',
            'fullStaticUrl': ujoin(self.base_url, 'static', self.name),
            'frontendUrl': ujoin(self.base_url, 'example/'),
            'mathjaxUrl': mathjax_url,
            'mathjaxConfig': mathjax_config
        }
        return self.write(
            self.render_template(
                'index.html',
                static=self.static_url,
                base_url=self.base_url,
                token=self.settings['token'],
                page_config=config_data
                )
            )


class SimpleApp(LabServerApp):

    extension_url = '/simple'
    default_url = '/simple'
    app_url = "/simple"
    name = __name__
    app_name = 'JupyterLab Example Notebook'
    app_settings_dir = os.path.join(HERE, 'build', 'application_settings')
    schemas_dir = os.path.join(HERE, 'build', 'schemas')
    static_dir = os.path.join(HERE, 'build')
    templates_dir = os.path.join(HERE, 'templates')
    themes_dir = os.path.join(HERE, 'build', 'themes')
    user_settings_dir = os.path.join(HERE, 'build', 'user_settings')
    workspaces_dir = os.path.join(HERE, 'build', 'workspaces')

    serverapp_config = {
        "jpserver_extensions": {
            "nbclassic": True
        }
    }

    def initialize_handlers(self):
        """Add example handler to Lab Server's handler list.
        """
        self.handlers.append(
            ('/simple', SimpleHandler)
        )


if __name__ == '__main__':
    SimpleApp.launch_instance()
