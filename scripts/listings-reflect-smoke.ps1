param(
  [string]$BaseUrl = "http://localhost:3000",
  [Parameter(Mandatory = $true)]
  [string]$ListingId,
  [ValidateSet("present", "absent", "title")]
  [string]$ExpectedState = "present",
  [string]$ExpectedTitle = "",
  [int]$TimeoutSeconds = 10,
  [int]$PollEverySeconds = 2
)

if ($ExpectedState -eq "title" -and [string]::IsNullOrWhiteSpace($ExpectedTitle)) {
  Write-Error "ExpectedTitle is required when ExpectedState is 'title'."
  exit 1
}

function Get-PublishedListings {
  param([string]$Url)
  $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $requestUrl = "$Url/api/listings?published=true&t=$timestamp"
  try {
    $response = Invoke-RestMethod -Uri $requestUrl -Method Get -TimeoutSec 15
    if ($null -eq $response -or $null -eq $response.listings) {
      return @()
    }
    return @($response.listings)
  } catch {
    Write-Warning ("Fetch failed: " + $_.Exception.Message)
    return @()
  }
}

function Get-ListingById {
  param(
    [object[]]$Listings,
    [string]$Id
  )
  return $Listings | Where-Object { $_.id -eq $Id } | Select-Object -First 1
}

Write-Host "Fetching baseline published listings..."
$baselineListings = Get-PublishedListings -Url $BaseUrl
$baselineListing = Get-ListingById -Listings $baselineListings -Id $ListingId

if ($null -eq $baselineListing) {
  Write-Host "Baseline: Listing $ListingId is currently absent from published list."
} else {
  Write-Host "Baseline: Listing $ListingId is present."
  Write-Host ("Baseline title: " + $baselineListing.title)
}

Write-Host ""
Write-Host "Now perform your manual mutation in the app (update/delete/approve)."
Read-Host "Press Enter when done"

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
$attempt = 0
$pass = $false

while ((Get-Date) -lt $deadline) {
  $attempt++
  $listings = Get-PublishedListings -Url $BaseUrl
  $listing = Get-ListingById -Listings $listings -Id $ListingId

  if ($ExpectedState -eq "present") {
    if ($null -ne $listing) {
      $pass = $true
      break
    }
  } elseif ($ExpectedState -eq "absent") {
    if ($null -eq $listing) {
      $pass = $true
      break
    }
  } else {
    if ($null -ne $listing -and $listing.title -eq $ExpectedTitle) {
      $pass = $true
      break
    }
  }

  Start-Sleep -Seconds $PollEverySeconds
}

if ($pass) {
  $elapsed = [Math]::Round(($TimeoutSeconds - ((New-TimeSpan -Start (Get-Date) -End $deadline).TotalSeconds)), 2)
  Write-Host ""
  Write-Host ("PASS: Expected state '" + $ExpectedState + "' observed within timeout.")
  if ($ExpectedState -eq "title") {
    Write-Host ("Observed title: " + $ExpectedTitle)
  }
  Write-Host ("Configured timeout: " + $TimeoutSeconds + "s, poll interval: " + $PollEverySeconds + "s")
  exit 0
}

Write-Host ""
Write-Error ("FAIL: Expected state '" + $ExpectedState + "' not observed within " + $TimeoutSeconds + "s.")
exit 1
