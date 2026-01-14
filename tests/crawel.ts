import Firecrawl from '@mendable/firecrawl-js';


const app = new Firecrawl({ apiKey: "fc-f0e469bd2f7540f8bf7fa59156d4a9dd"  });


// Perform a search:

app.scrape('https://www.zhihu.com/question/1965020459205619746/answer/1986222076827296603').then(r =>  {
    console.log(r.json);
    console.log(r.images);
    console.log(r.markdown);
    console.log(r.summary)
})