from setuptools import setup, find_packages


setup(
    name='superbmd_backend', 
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'pyramid',
        'waitress',
        'sqlalchemy',
        'psycopg2-binary',
        'alembic',
        'bcrypt',
        'marshmallow',
        'webtest',
        'pyramid_jwt',
        'pyramid_tm', 
        'zope.sqlalchemy',
        'pyramid_retry', 
    ],
    entry_points={
        'paste.app_factory': [
            'main = superbmd_backend:main', 
        ],
    },
)