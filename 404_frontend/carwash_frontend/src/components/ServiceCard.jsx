function ServiceCard({service,book}){

return(

<div className="card">

<h3>{service.name}</h3>

<p>Price : ₹{service.price}</p>
<p>Duration : {service.duration}</p>
<p>{service.description}</p>

<button onClick={()=>book(service.id)}>
Book Service
</button>

</div>

)

}

export default ServiceCard