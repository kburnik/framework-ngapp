
app

.factory('api', function( $http , $rootScope ) {

  var isBusy = false;

  var extendPromise = function( promise )
  {

    isBusy = true;

    promise.ready = function( usersCompleteCallback, failCallback ) {
      promise.success(function( response ) {

        isBusy = false;

        if ( response && response.status == 'success' )
        {
          usersCompleteCallback( response.result , response );
          $rootScope.$emit('success',response.message);

        }
        else if ( ! response.status )
        {
          // server error
          $rootScope.$emit( 'error' ,
            [
              'Server error' ,
              response
            ]
          );

        }
        else if ( response.status == 'error' )
        {
          if ((typeof failCallback) == "function")
            if (failCallback(response));
              return;

          // api error
          $rootScope.$emit( 'error' ,
            [
              'API error' ,
              response.message
            ]
          );

        }

      });

      return promise;
    }

    // serverside system error
    promise.error(function(data, status, headers, config){
      if (data && data.status == 'error') {
        if ((typeof failCallback) == "function") {
          failCallback(data);
        }

        $rootScope.$emit('error' , data.message);
      } else {
        $rootScope.$emit( 'error' ,
          [
            'HTTP error' ,
            { data:data, status:status, headers:headers, config:config }
          ]
        );
      }

    });

    return promise;
  }

  var apiConstructor  = function( endPoint , entityName )
  {

    var _api =  {

      endPoint:endPoint,

      entityName:entityName,

      isBusy:function()
      {
        return isBusy;
      },

      use:function( entityName )
      {
        this[ entityName ] = new apiConstructor( endPoint , entityName );

        return this[ entityName ];

      },
      extend:function( methodName ) {
        var t = this;
        var method = this[ methodName ] = function( params ) {
          return t.call( methodName , params );
        };

        return t;
      },

      extendPost:function( methodName ) {
        var t = this;
        var method = this[ methodName ] = function( params ) {
          return t.callPost( methodName , params );
        };

        return t;
      },

      call:function( methodName , params ) {
        params = params || {};

        var promise = $http.get(  this.endPoint + '/' + this.entityName + '/@' + methodName , {params: params} );

        return extendPromise( promise );
      },

      callPost:function(methodName, params){
        var promise = $http.post(
          this.endPoint + '/' + this.entityName + '/@' + methodName , params );

        return extendPromise(promise);
      },

      find:function( params ){
        var params = params || {};

        var promise = $http({
          url:this.endPoint + '/' + this.entityName + '/@find?' + $.param( params ),
          method:'GET'
        });

        return extendPromise( promise );
      },

      fields:function(){
        return this.call('fields');
      },

      count:function( params ){
        return this.call('count' , params);
      },

      findFirst:function( filter  ){
        var params = filter || {};

        var promise = $http.get(  this.endPoint + '/' + this.entityName + '/@findFirst' , {params: params} );

        return extendPromise( promise );
      },

      findById:function( id ){

        var promise = $http.get(  this.endPoint + '/' + this.entityName + '/' + id , {params: {}} );

        return extendPromise( promise );
      },

      insert:function( params ) {
        params = params || {};
        var promise = $http.post(  this.endPoint + '/' + this.entityName + '/@insert' , params );

        return extendPromise( promise );
      },
      erase:function( id ) {
        var params = {};
        params.id = id;
        var promise = $http.post(  this.endPoint + '/' + this.entityName + '/@delete' , params );

        return extendPromise( promise );
      },
      update:function( params ) {
        params = params || {};
        var promise = $http.post(  this.endPoint + '/' + this.entityName + '/@update' , params );

        return extendPromise( promise );
      },
      commit:function( changeset ) {
        var promise = $http.post(  this.endPoint + '/' + this.entityName + '/@commit' , changeset );
        return extendPromise( promise );
      }

    };


    return _api;

  }

  return apiConstructor;
});
