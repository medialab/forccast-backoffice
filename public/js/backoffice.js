var getEndpoint = function(endpoint, params, callback){
  $.getJSON( '/api/'+ endpoint, params, function( data ) {
    console.log(data)
    callback(null, data);
  })
}

var update = function(endpoint,all,btn) {

  $(btn).button('loading');

  var q = d3.queue()

  if(all){

    var endpoints = endpoint.split(',');

    endpoints.forEach(function(endpoint){
      if(endpoint == 'news'){
        q.defer(getEndpoint, endpoint, {lang:'fr'})
        q.defer(getEndpoint, endpoint, {lang:'en'})
      }else{
        q.defer(getEndpoint, endpoint, null)
      }

    })
  }else{
    if(endpoint == 'news'){
      q.defer(getEndpoint, endpoint, {lang:'fr'})
      q.defer(getEndpoint, endpoint, {lang:'en'})
    }else{
      q.defer(getEndpoint, endpoint, null)
    }
  }


  q.awaitAll(function(err, res) {
      if(err){
        $(btn).toggleClass('btn-default')
        $(btn).toggleClass('btn-danger')
        $(btn).text('Some errors occured!')
        $(btn).parent().parent().find('.console').text(JSON.stringify(err))
      }else{
        var errors = res.filter(function(d){
          return d.status != 'ok'
        })

        if(errors.length){
          $(btn).toggleClass('btn-default')
          $(btn).toggleClass('btn-danger')
          $(btn).text('Some errors occured!')
          $(btn).parent().parent().find('.console').text(JSON.stringify(errors))
        }else{
          $(btn).toggleClass('btn-default')
          $(btn).toggleClass('btn-success')
          $(btn).text('All files were saved!')
          $(btn).parent().parent().find('.console').text('')
        }

      }

      setTimeout(function(){
        $(btn).removeClass('btn-success');
        $(btn).removeClass('btn-danger');
        $(btn).toggleClass('btn-default');
        $(btn).button('reset');
      },2500)

    });
}
