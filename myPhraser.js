PhrasesList = new Mongo.Collection('phrase');

if (Meteor.isClient) {

  

    Template.prompt.events({
      'submit form': function(event){
            event.preventDefault();
            var inputUrl = event.target.inputUrl.value;
            
            var info = Meteor.call('getFile', inputUrl);
            console.log('info',info);
        }
    });
}

if (Meteor.isServer) {
    console.log('SERVER RUNNING');
    Meteor.methods({
        'getFile': function(url){
            //console.log(url);
            try{
                var result = HTTP.call('GET', url);
                console.log(result.content);
                
            }
            catch(e){
                console.log(e);
                
                return false;
            }
            console.log('url', url);
            console.log('result.content', result.content); 
            var phraseCounts = Meteor.call('pairCounter', result.content, url);
            //console.log('phraseCounts',phraseCounts);
            //return phraseCounts;
            return 'hello';
        }, 
        'pairCounter': function(doc, url){
            //console.log('made it to pairCounter'); 
            
            //console.log('doc', doc); 
            var arrayified = Meteor.call('arrify', doc),       //returns an array where each element is a two word phrase containted in the original string 
            
            counted = Meteor.call('tally', arrayified);        //return an nested array, the first subarray contains all the unique 2 word phrases 
            //console.log('counted', counted);                             //the second subarray contains the 
                                                                //correspondinc out for each phrase   
            var arranged = Meteor.call('arrange', counted);    //rearranges both subarrays such that they are in decending order 
            var finalData = Meteor.call('display',arranged,url);
            return finalData;     
        }, 
        'arrify': function(str){ 
            console.log('made it to arrify'); 
            var splitArray = str.split(' ').map(function(element){
                return element.trim();
            });                                                                 //splits sting at white spaces into an array
            console.log('splitArray', splitArray);
            var combindArray = [];

            for(var j = 0; j < splitArray.length-1; j++){                       //creates a new array from the splitArray where each  
                combindArray.push(splitArray[j]+' '+splitArray[j+1]);           //element is two word phrase contained in the original string
            }
                
            console.log('combindArray',combindArray);
            return combindArray;
        },
        'tally': function(arr) {                          //function accepts an array and returns a nested array. 
            console.log('made it to tally');             //first nested array contains all unique elements in argument array.
            var a = [], b = [], prev;                   // second nested array contains the number of occurances
                                                        //of each unique element and
                                                        //stores it in the corresponding
                                                        //index
            arr.sort();
            for ( var i = 0; i < arr.length; i++ ) {
                if ( arr[i] !== prev ) {
                    a.push(arr[i]);
                    b.push(1);
                } else {
                    b[b.length-1]++;
                }
                prev = arr[i];
            }
            console.log('tally', [a,b])
            return [a, b];
        },
        'isSorted': function(arr){                     //function accepts array containing integers. returns true if array is in decending order 
            console.log('made it to isSorted');
            for(var z = 0; z < arr.length-1; z++)   //otherwise returns false
            {
                if(arr[z]<arr[z+1]) return false
            }
            
            return true;
        },

        'arrange': function (arr){                     //function accepts nested array. returns nested array containing the same element sorted in
            console.log('made it to arrange')
            var counts = arr[1];                    //decending order. the subarray of stings follows the soring logic of subarray of ints

            var phrase = arr[0];
            var temp;
            while(!Meteor.call('isSorted',counts)){                          //checks to see if the list is not sorted. if it is not keep sorting it.

                for(var k = 0; k < counts.length-1; k++){      //steps through both subarrays and switchs the two adjecent elements
                    if(counts[k]<counts[k+1]){                 //of both arrays if the two adjecent elements of interger subarray 
                        temp = counts[k]                       //are in accending order  
                        counts[k] = counts[k+1]
                        counts[k+1] = temp

                        temp=phrase[k]
                        phrase[k] = phrase[k+1]
                        phrase[k+1] = temp
                    }
                }
            }
            return [phrase, counts];
        },
        'display': function(arr, url){                                      //prints out the phrases and the count for each phrase
            console.log('arr',arr)
            var objArray = [],
            returnArray = [];
            if(arr[0].length>10){                                            //if there are more than 10 phrases. only print the first 10
                for(var x = 0; x < 10; x++){
                    returnArray.push(arr[0][x]+': '+ arr[1][x]);
                    console.log('show '+arr[0][x]+': '+ arr[1][x]);

                    objArray.push({phrase: arr[0][x], count: arr[1][x]})
                }
            } else {                                                        //otherwise print all the phrases and counts.
                for(var x = 0; x < arr[0].length; x++){
                    returnArray.push(arr[0][x]+': '+ arr[1][x]);
                    console.log('show '+arr[0][x]+': '+ arr[1][x]);
                    
                    objArray.push({phrase: arr[0][x], count: arr[1][x]})
                }
            }
            var obj = {url: url, phraseList: objArray};
            console.log('obj', obj);
            PhrasesList.insert(obj);
            return returnArray;
                        
        }
    })

}
