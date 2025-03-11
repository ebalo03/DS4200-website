// Load the data for the box plot
const socialMedia = d3.csv("socialMedia.csv");

socialMedia.then(function(data) {
    // Convert string values to numbers for 'Likes'
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 30, bottom: 40, left: 50},
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container inside #boxplot div
    const svg = d3.select("#boxplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))]) // Get unique platform names
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)]) // Set y-axis domain to range from 0 to max Likes
        .nice()
        .range([height, 0]);

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g").call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)") // Rotate the y-axis label
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .attr("text-anchor", "middle")
        .text("Number of Likes");

    // Function to calculate quartiles for box plot
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending); // Sort the Likes data
        const min = d3.min(values); // Minimum value
        const q1 = d3.quantile(values, 0.25); // First quartile
        const median = d3.quantile(values, 0.5); // Median (second quartile)
        const q3 = d3.quantile(values, 0.75); // Third quartile
        const max = d3.max(values); // Maximum value
        return {min, q1, median, q3, max};
    };

    // Group data by platform and calculate quartiles for each group
    const quartilesByPlatform = d3.rollup(data, rollupFunction, d => d.Platform);

    quartilesByPlatform.forEach((quantiles, Platform) => {
        const x = xScale(Platform);
        const boxWidth = xScale.bandwidth() * 0.6;

        // Draw vertical line (whiskers) from min to max
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");

        // Draw box from Q1 to Q3 (the interquartile range)
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("fill", "lightblue")
            .attr("stroke", "black");

        // Draw median line inside the box
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "black");
    });
});

// Load the data for the side-by-side bar plot
const socialMediaBar = d3.csv("socialMedia.csv");

socialMediaBar.then(function(data) {
    // Convert string values to numbers for 'Likes'
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Calculate average Likes for each Platform and PostType
    const avgLikesByPlatformPostType = d3.rollup(data, 
        v => d3.mean(v, d => d.Likes), // Calculate mean for each group
        d => d.Platform,  
        d => d.PostType  
    );

    const avgLikesArray = [];
    avgLikesByPlatformPostType.forEach((postTypes, platform) => {
        postTypes.forEach((avgLikes, postType) => {
            avgLikesArray.push({ Platform: platform, PostType: postType, AvgLikes: avgLikes });
        });
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales for x0 (platform) and x1 (post type) and y (likes)
    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))]) // Get unique platform names
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))]) // Get unique post types
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)]) // Set y-axis domain to range from 0 to max Likes
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.PostType))]) // Get unique post types for color scale
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // Add x0 and y axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)") // Rotate the y-axis label
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .attr("text-anchor", "middle")
        .text("Average Number of Likes");

    // Group container for bars
    const barGroups = svg.selectAll(".bar-group")
        .data(avgLikesArray)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d.Platform)},0)`);

    // Draw bars for each post type
    barGroups.append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];

    types.forEach((type, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(type)
            .attr("alignment-baseline", "middle");
    });
});

// Load the data for the line plot
const socialMediaTime = d3.csv("socialMedia.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers and parse Date
    const parseDate = d3.timeParse("%m/%d/%Y");
    data.forEach(function(d) {
        d.Likes = +d.Likes;
        d.Date = parseDate(d.Date); // Parse the date string into a Date object
    });

    // Calculate average Likes for each Date
    const avgLikesByDate = d3.rollup(data, 
        v => d3.mean(v, d => d.Likes), // Calculate mean for each date
        d => d.Date
    );

    const avgLikesDateArray = [];
    avgLikesByDate.forEach((avgLikes, date) => {
        avgLikesDateArray.push({ Date: date, AvgLikes: avgLikes });
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#lineplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales for x (time) and y (likes)
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date)) // Set x-axis domain to time range
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)]) // Set y-axis domain to range from 0 to max Likes
        .nice()
        .range([height, 0]);

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)") // Rotate the y-axis label
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .attr("text-anchor", "middle")
        .text("Average Number of Likes");

    // Draw the line path
    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.AvgLikes))
        .curve(d3.curveNatural); // Smooth line curve

    svg.append("path")
        .data([avgLikesDateArray])
        .attr("fill", "none")
        .attr("stroke", "#1f77b4")
        .attr("stroke-width", 2)
        .attr("d", line); // Set the 'd' attribute to draw the path
});

