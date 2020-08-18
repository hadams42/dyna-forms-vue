call npm run build
copy dist\build.js C:\LocalDeployment\NPM\dyna-form.js

pushd C:\Development\~DynaFormFramework\DynaFormWeb\DynaFormWeb\Scripts
call update.bat
popd

pushd C:\Development\GlobalMission\AM-MPS\MissionFunding\MissionFunding\Scripts
call update.bat
popd

pushd C:\Development\~ADL\EbstoreWeb\EbstoreWeb\Scripts\
call update.bat
popd
