import PocketBase from 'pocketbase'

// Cliente singleton PocketBase para consumo reativo e persistência de telemetria
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)
pb.autoCancellation(false)

export { pb }
export default pb
