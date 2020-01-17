// $("#loginBtn").on("click", function (event) {
//     // Make sure to preventDefault on a submit event.
//     event.preventDefault();
    
//     var data = {}
//     data.username = $("#username").val();
//     data.password = $("#password").val();
  
//     $.ajax({
//       type: "POST",
//       url: "/login",
//       data: data
//     }).then(function (res) {
//       console.log('You have LOGGED IN!!')
//       console.log(res)
//       // res.sendFile('main.html')
  
//     }).catch(function (err) {
//       // On error sends to main page anyway for demo purposes
//     //   window.location.replace("/main.html");
//       console.log('not getting user or wrong credentials')
//     })
//   });