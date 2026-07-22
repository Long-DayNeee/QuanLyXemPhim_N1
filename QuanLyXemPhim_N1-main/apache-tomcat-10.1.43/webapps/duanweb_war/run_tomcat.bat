@echo off
setlocal
chcp 65001 >nul

REM ================== CẤU HÌNH ==================
REM Đường dẫn JDK 17
SET "JAVA_HOME=D:\File JDK17"

REM Đường dẫn Tomcat 10.1.43
SET "CATALINA_HOME=D:\Tomcat_SD22141\apache-tomcat-10.1.43-windows-x64\apache-tomcat-10.1.43"

REM Thư mục gốc DuAnWeb, chính là nơi đặt file run_tomcat.bat này
SET "PROJECT_ROOT=%~dp0"
SET "FRONTEND_DOCBASE=%PROJECT_ROOT:~0,-1%"
SET "MAVEN_PROJECT=%PROJECT_ROOT%MavenProject\duanweb"
SET "CONTEXT_DIR=%CATALINA_HOME%\conf\Catalina\localhost"
SET "FRONTEND_CONTEXT=%CONTEXT_DIR%\DuAnWeb.xml"
SET "WAR_SOURCE=%MAVEN_PROJECT%\target\duanweb.war"
SET "WAR_TARGET=%CATALINA_HOME%\webapps\duanweb.war"

echo ==================================================
echo  Chạy DuAnWeb bằng Tomcat từ VS Code
echo ==================================================
echo.

IF NOT EXIST "%JAVA_HOME%\bin\java.exe" (
  echo [ERROR] Không tìm thấy Java tại: %JAVA_HOME%
  echo Hãy sửa JAVA_HOME trong file run_tomcat.bat
  pause
  exit /b 1
)

IF NOT EXIST "%CATALINA_HOME%\bin\startup.bat" (
  echo [ERROR] Không tìm thấy Tomcat tại: %CATALINA_HOME%
  echo Hãy sửa CATALINA_HOME trong file run_tomcat.bat
  pause
  exit /b 1
)

IF NOT EXIST "%MAVEN_PROJECT%\pom.xml" (
  echo [ERROR] Không tìm thấy Maven project tại: %MAVEN_PROJECT%
  pause
  exit /b 1
)

echo [1/5] Tạo context để Tomcat chạy frontend tại /DuAnWeb ...
IF NOT EXIST "%CONTEXT_DIR%" mkdir "%CONTEXT_DIR%"
> "%FRONTEND_CONTEXT%" echo ^<Context docBase="%FRONTEND_DOCBASE%" reloadable="true" /^>

echo [2/5] Build Java API thành file WAR ...
pushd "%MAVEN_PROJECT%"
call mvn clean package
IF ERRORLEVEL 1 (
  popd
  echo [ERROR] Maven build thất bại.
  pause
  exit /b 1
)
popd

echo [3/5] Deploy duanweb.war vào Tomcat ...
copy /Y "%WAR_SOURCE%" "%WAR_TARGET%" >nul
IF ERRORLEVEL 1 (
  echo [ERROR] Copy WAR thất bại.
  pause
  exit /b 1
)

echo [4/5] Khởi động Tomcat ...
call "%CATALINA_HOME%\bin\startup.bat"

echo [5/5] Mở trang quản lý phim ...
timeout /t 5 /nobreak >nul
start "" "http://localhost:8080/DuAnWeb/QuanLyPhim.html"

echo.
echo ==================================================
echo  Đã chạy xong.
echo.
echo  Frontend:
echo    http://localhost:8080/DuAnWeb/QuanLyPhim.html
echo.
echo  Java API:
echo    http://localhost:8080/duanweb/api/add-showtime
echo    http://localhost:8080/duanweb/api/movies
echo    http://localhost:8080/duanweb/api/showtimes?movieId=1
echo.
echo  Lưu ý: MySQL vẫn cần được bật trong XAMPP.
echo ==================================================
pause