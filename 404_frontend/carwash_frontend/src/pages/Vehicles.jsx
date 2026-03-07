import {useEffect,useState} from "react"
import API from "../api/axios"
import Navbar from "../components/Navbar"
import VehicleCard from "../components/VehicleCard"

function Vehicles(){

const [vehicles,setVehicles] = useState([])

useEffect(()=>{

API.get("vehicles/")
.then(res=>setVehicles(res.data))

},[])

return(

<div>

<Navbar/>

<div className="container">

<h2>My Vehicles</h2>

{vehicles.map(v=>(
<VehicleCard key={v.id} vehicle={v}/>
))}

</div>

</div>

)

}

export default Vehicles