$response = Invoke-WebRequest -Uri "http://localhost:5001/check-users" -UseBasicParsing $false
$content = $response.Content | ConvertFrom-Json
Write-Host "Users in database:"
$content.users | ForEach-Object {
    Write-Host "Email: $($_.email), Name: $($_.name), Role: $($_.role), HasPassword: $($_.hasPassword)"
}
