import sphinx_bootstrap_theme

needs_sphinx = '1.3'

project = u'Literacy'
copyright = u'2017, Woof Woof, Inc.'
author = u'Woof Woof, Inc.'

version = '0.2.3'
release = '0.2.3'

templates_path = ['_templates']
exclude_patterns = ['_build']

source_suffix = '.rst'
master_doc = 'index'

language = None
pygments_style = 'sphinx'

extensions = [
    'sphinx.ext.githubpages',
]

# -- Options for HTML output ----------------------------------------------

html_theme = 'bootstrap'
html_theme_path = sphinx_bootstrap_theme.get_html_theme_path()

html_title = project

html_show_sourcelink = False
html_show_sphinx = False
html_show_copyright = False

html_theme_options = {
    'navbar_site_name': "Contents",
    'navbar_pagenav': False,
    'globaltoc_depth': 2,
    'navbar_class': "navbar navbar-inverse",
    'navbar_fixed_top': "true",
    'bootswatch_theme': "simplex",
}
