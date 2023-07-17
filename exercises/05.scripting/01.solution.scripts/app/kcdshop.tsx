// Ignore this file please
import { KCDShopIFrameSync } from '@kentcdodds/workshop-app/iframe-sync'
import { useNavigate } from '@remix-run/react'
import * as React from 'react'

export function KCDShop() {
	const navigate = useNavigate()
	return <KCDShopIFrameSync React={React} navigate={navigate} />
}
