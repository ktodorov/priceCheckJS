// // var token = window.localStorage.getItem('token');

// // if (token) {
// //     $.ajaxSetup({
// //         headers: {
// //             'x-access-token': token
// //         }
// //     });
// // }

// $(function() {
//     $('#loginForm').submit(function() {
//         $.post($(this).attr('action'), $(this).serialize(), function(json) {
//             if (json.token) {
//                 window.localStorage.setItem("token", json.token);
//                 $.ajaxSetup({
//                     headers: {
//                         'x-access-token': json.token
//                     }
//                 });
//                 // $.ajax("/products", {
//                 //     type: "GET"
//                 // });
//                 window.location.href = '/products';
//             }
//         }, 'json');
//         return false;
//     });
// });