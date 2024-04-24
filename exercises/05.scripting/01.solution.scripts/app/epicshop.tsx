// Ignore this file please
import { EpicShopIFrameSync } from '@epic-web/workshop-utils/iframe-sync'
import { useNavigate } from '@remix-run/react'
import * as React from 'react'

export function EpicShop() {
	const navigate = useNavigate()
	return <EpicShopIFrameSync React={React} navigate={navigate} />
}
