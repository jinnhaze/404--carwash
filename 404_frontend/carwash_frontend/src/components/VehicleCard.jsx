function VehicleCard({vehicle}){

return(

<div className="card">

<h3>{vehicle.car_name}</h3>

<p>Model : {vehicle.model}</p>
<p>Plate : {vehicle.number_plate}</p>
<p>Color : {vehicle.color}</p>

</div>

)

}

export default VehicleCard