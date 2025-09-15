# Get the directory of this script
$scriptDirectory = $PSScriptRoot

# Load individual function files using absolute paths
. "$scriptDirectory\BelieveOrNotServiceName.ps1"

. "$scriptDirectory\Install-DistributedService.ps1"
. "$scriptDirectory\Uninstall-DistributedService.ps1"
. "$scriptDirectory\Start-DistributedService.ps1"
. "$scriptDirectory\Stop-DistributedService.ps1"
. "$scriptDirectory\Write-ServiceLog.ps1"

$ServiceName = $global:believeOrNotServiceName

function InstallBelieveOrNotService {
    [CmdletBinding()]
    param ()

    # Log function parameters
    Write-ServiceLog -Message "InstallBelieveOrNotService - Parameters:" -Level "Info"
    Write-ServiceLog -Message "  scriptDirectory = '$scriptDirectory'" -Level "Info"
    Write-ServiceLog -Message "  ServiceName = '$ServiceName'" -Level "Info"

    Install-DistributedService -ServiceName $ServiceName
}

function UninstallBelieveOrNotService {
    [CmdletBinding()]
    param ()

    Uninstall-DistributedService -ServiceName $ServiceName
}

function StartBelieveOrNotService {
    [CmdletBinding()]
    param ()

    Start-DistributedService -ServiceName $ServiceName
}

function StopBelieveOrNotService {
    [CmdletBinding()]
    param ()

    Stop-DistributedService -ServiceName $ServiceName
}
