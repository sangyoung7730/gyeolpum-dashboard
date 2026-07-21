$sp = "C:\Users\dure\AppData\Local\Temp\claude\C--Users-dure\bf725acf-3aa5-4422-a579-66457981aa95\scratchpad\gyeolpum"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
  $wb = $excel.Workbooks.Open("C:\Users\dure\Desktop\AI 폴더\생활재마스터.xlsx", 0, $true)
  $ws = $wb.Worksheets.Item(1)
  $rows = $ws.UsedRange.Rows.Count
  $vals = $ws.UsedRange.Resize($rows, 11).Value2   # 1생활재코드 3담당자 4대분류 7생산지명 8생활재명 11공급여부
  $sb = New-Object System.Text.StringBuilder
  for ($r = 1; $r -le $rows; $r++) {
    $line = @($vals[$r,1], $vals[$r,3], $vals[$r,4], $vals[$r,7], $vals[$r,8], $vals[$r,11]) | ForEach-Object {
      if ($null -eq $_) { '' } else { ($_.ToString() -replace "[\t\r\n]", ' ') } }
    [void]$sb.AppendLine(($line -join "`t"))
  }
  [IO.File]::WriteAllText("$sp\master_dump.tsv", $sb.ToString(), [Text.Encoding]::UTF8)
  Write-Output "dumped $rows rows"
  $wb.Close($false)
} finally { $excel.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null }
