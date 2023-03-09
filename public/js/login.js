
 //FrontEnd Section
 
const login =  async (email, password)=>{
    let res ;

    try{

         res= await axios({
                method:'POST',
                url:'/api/v1/users/login',  
               
                data:{
                    // email:email
                    email,
                    password
                }
            });

        }
              
          
        catch(err){
        
            // console.log(err.response.data);
             alert(err.response.data.message);
        }
            
         //conole.log(res)
         if(res.data.status ==='success')
         {
                     alert(" Location in successfully ");
                     window.setTimeout(() => {
                         location.assign('/')
                     }, 1000);
                 }      

     
        }
       

const logout =  async()=>{
    let res;
     try{
         res = await axios({
             method:'GET',
             url:'/api/v1/users/logout'
         })

     }
     catch(err){
        alert(err.response.data.message);
     }


     if(res.data.status ==='success')
         {
                 location.reload(true)      
        }

}




//*******for lo */

document.querySelector('.form').addEventListener('submit' , e=>{
    //console.log(e);
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value
     login(email , password)
  //  console.log(email , password);
})