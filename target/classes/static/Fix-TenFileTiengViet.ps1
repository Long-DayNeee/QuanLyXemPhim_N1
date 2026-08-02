# ============================================================
# Sửa tên file/thư mục bị hỏng dạng #Uxxxx thành ký tự Unicode
# thật (ví dụ "N#U0103m" -> "Năm").
# Chạy 1 LẦN DUY NHẤT, từ thư mục gốc chứa DuLieu (hoặc trỏ -Path).
# ============================================================
param(
    [string]$Path = ".\src\main\resources\static\DuLieu"
)

if (-not (Test-Path $Path)) {
    Write-Host "Khong tim thay thu muc: $Path" -ForegroundColor Red
    Write-Host "Chay lai voi: .\Fix-TenFileTiengViet.ps1 -Path 'duong\dan\den\DuLieu'"
    exit 1
}

function Convert-TenHong($ten) {
    return [System.Text.RegularExpressions.Regex]::Replace(
        $ten,
        '#U([0-9a-fA-F]{4})',
        { param($m) [char]([Convert]::ToInt32($m.Groups[1].Value, 16)) }
    )
}

# Đổi tên file trước (sâu nhất trước), rồi đến thư mục, để tránh path bị lệch giữa chừng
$items = Get-ChildItem -Path $Path -Recurse | Sort-Object { $_.FullName.Length } -Descending

$count = 0
foreach ($item in $items) {
    if ($item.Name -match '#U[0-9a-fA-F]{4}') {
        $tenMoi = Convert-TenHong $item.Name
        $duongDanMoi = Join-Path $item.PSParentPath.Substring($item.PSParentPath.IndexOf("::") + 2) $tenMoi
        Rename-Item -LiteralPath $item.FullName -NewName $tenMoi -ErrorAction Stop
        Write-Host "Da doi: $($item.Name)  ->  $tenMoi" -ForegroundColor Green
        $count++
    }
}

Write-Host ""
Write-Host "Hoan tat. Da sua $count muc." -ForegroundColor Cyan
