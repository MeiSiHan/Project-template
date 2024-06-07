https://blog.csdn.net/echozly/article/details/122131679


npm i -g windows-build-tools



C:\Users\you\.windows-build-tools\python-2.7.15.amd64.msi
C:\Users\you\.windows-build-tools\vs_BuildTools.exe.
C:\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools>

C:\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools>

C:\Users\you\AppData\Roaming\npm\node-gyp -> C:\Users\you\AppData\Roaming\npm\node_modules\node-gyp\bin\node-gyp.js
+ node-gyp@7.1.2


"ffi-napi": "^3.0.1",
    "ref-array-napi": "^1.2.1",
    "ref-napi": "^2.0.3",
    "ref-struct-napi": "^1.1.1"


node-gyp@7.1.2  C:\Users\you\AppData\Roaming\npm\node_modules\node-gyp
node@14.15.3
npm@6.14.9 C:\Program Files\nodejs\node_modules\npm

npm config list
; cli configs
metrics-registry = "https://registry.npmjs.org/"
scope = ""
user-agent = "npm/6.14.9 node/v14.15.3 win32 x64"

; builtin config undefined
prefix = "C:\\Users\\you\\AppData\\Roaming\\npm"

; node bin location = C:\Program Files\nodejs\node.exe
; cwd = C:\files\test
; HOME = C:\Users\you
; "npm config ls -l" to show all defaults.



C:\Python27\python.exe
C:\Users\you\AppData\Local\Microsoft\WindowsApps\python.exe




node-gyp list
gyp info it worked if it ends with ok
gyp info using node-gyp@7.1.2
gyp info using node@14.15.3 | win32 | x64
14.15.3
gyp info ok

node-gyp configure

node-gyp build
gyp info it worked if it ends with ok
gyp info using node-gyp@7.1.2
gyp info using node@14.15.3 | win32 | x64
gyp info spawn C:\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools\MSBuild\15.0\Bin\MSBuild.exe
gyp info spawn args [
gyp info spawn args   'build/binding.sln',
gyp info spawn args   '/clp:Verbosity=minimal',
gyp info spawn args   '/nologo',
gyp info spawn args   '/p:Configuration=Release;Platform=x64'
gyp info spawn args ]
在此解决方案中一次生成一个项目。若要启用并行生成，请添加“/m”开关。
  hello.vcxproj -> C:\files\test\build\Release\\hello.node
gyp info ok

C:\files\test>node index.js
fii.Library Hello result: Hello! This is Cpp Addon !
fii.Library Add result: 3
fii.Library Add result: 11






node-gyp rebuild
gyp info it worked if it ends with ok
gyp info using node-gyp@7.1.2
gyp info using node@14.15.3 | win32 | x64
gyp info find Python using Python version 2.7.15 found at "C:\Python27\python.exe"
gyp info find VS using VS2017 (15.9.33801.237) found at:
gyp info find VS "C:\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools"
gyp info find VS run with --verbose for detailed information
gyp info spawn C:\Python27\python.exe
gyp info spawn args [
gyp info spawn args   'C:\\Users\\you\\AppData\\Roaming\\npm\\node_modules\\node-gyp\\gyp\\gyp_main.py',
gyp info spawn args   'binding.gyp',
gyp info spawn args   '-f',
gyp info spawn args   'msvs',
gyp info spawn args   '-I',
gyp info spawn args   'C:\\files\\test\\build\\config.gypi',
gyp info spawn args   '-I',
gyp info spawn args   'C:\\Users\\you\\AppData\\Roaming\\npm\\node_modules\\node-gyp\\addon.gypi',
gyp info spawn args   '-I',
gyp info spawn args   'C:\\Users\\you\\AppData\\Local\\node-gyp\\Cache\\14.15.3\\include\\node\\common.gypi',
gyp info spawn args   '-Dlibrary=shared_library',
gyp info spawn args   '-Dvisibility=default',
gyp info spawn args   '-Dnode_root_dir=C:\\Users\\you\\AppData\\Local\\node-gyp\\Cache\\14.15.3',
gyp info spawn args   '-Dnode_gyp_dir=C:\\Users\\you\\AppData\\Roaming\\npm\\node_modules\\node-gyp',
gyp info spawn args   '-Dnode_lib_file=C:\\\\Users\\\\you\\\\AppData\\\\Local\\\\node-gyp\\\\Cache\\\\14.15.3\\\\<(target_arch)\\\\node.lib',
gyp info spawn args   '-Dmodule_root_dir=C:\\files\\test',
gyp info spawn args   '-Dnode_engine=v8',
gyp info spawn args   '--depth=.',
gyp info spawn args   '--no-parallel',
gyp info spawn args   '--generator-output',
gyp info spawn args   'C:\\files\\test\\build',
gyp info spawn args   '-Goutput_dir=.'
gyp info spawn args ]
gyp info spawn C:\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools\MSBuild\15.0\Bin\MSBuild.exe
gyp info spawn args [
gyp info spawn args   'build/binding.sln',
gyp info spawn args   '/clp:Verbosity=minimal',
gyp info spawn args   '/nologo',
gyp info spawn args   '/p:Configuration=Release;Platform=x64'
gyp info spawn args ]
在此解决方案中一次生成一个项目。若要启用并行生成，请添加“/m”开关。
  hello.cc
c:\files\test\src\hello.cc : warning C4819: 该文件包含不能在当前代码页(936)中表示的字符。请将该文件保存为 Unicode 格式以防止数据丢失 [C:\files\test\build\he
llo.vcxproj]
  win_delay_load_hook.cc
    正在创建库 C:\files\test\build\Release\hello.lib 和对象 C:\files\test\build\Release\hello.exp
  正在生成代码
  All 26 functions were compiled because no usable IPDB/IOBJ from previous compilation was found.
  已完成代码的生成
  hello.vcxproj -> C:\files\test\build\Release\\hello.node
gyp info ok



