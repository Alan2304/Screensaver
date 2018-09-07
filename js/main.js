// Constants.
var secondsPerImage = 5;
var secondsPerFade = 1;
var stepsPerSecond = 25;
var mousetimeout;
var screensaver_active = false;
var idletime = 5;
var content;
var setTime;

// Timer variables.
var imageList;
var timeIndex = 0;

// DOM objects.
var frontDiv;
var frontImage;
var backDiv;
var backImage;

// Pan and zoom parameters.
var edgePercent = 0.10;


function makeBurns(width, height, proportion)
{
	// Create the burns object.
	var burns = {
		_x0: 0,
		_x1: 0,
		_y0: 0,
		_y1: 0,
		_w0: 0,
		_w1: 0,
		_h0: 0,
		_h1: 0,
		apply: function(image) {
			image.width = (this._w1 - this._w0);
			image.height = (this._h1 - this._h0);
		}
	};

	// Choose the rectangles based on the more constrained dimension.
	if (proportion < width/height)
	{
		// Constrain width and let height float.
		burns._w0 = width * (1 + edgePercent * Math.random());
		burns._w1 = width * (1 + edgePercent * Math.random());
		burns._h0 = burns._w0 / proportion;
		burns._h1 = burns._w1 / proportion;
	}
	else
	{
		burns._h0 = height * (1 + edgePercent * Math.random());
		burns._h1 = height * (1 + edgePercent * Math.random());
		burns._w0 = burns._h0 * proportion;
		burns._w1 = burns._h1 * proportion;
	}

	// Calculate the translation to keep the image within the window.
	burns._x0 = (burns._w0 - width) * Math.random();
	burns._x1 = (burns._w1 - width) * Math.random();
	burns._y0 = (burns._h0 - height) * Math.random();
	burns._y1 = (burns._h1 - height) * Math.random();

	return burns;
}


// Pan and zoom objects.
var frontBurns;
var backBurns;

function setOpacity(image, value)
{
	if (image.filters && image.filters[0])
	{
		image.filters[0].opacity = value * 100;
	}
	else
	{
    	image.style.opacity = value;
    }
}

function stepTail(animationIndex)
{
	if (frontBurns){
		var time = animationIndex / ((secondsPerImage + secondsPerFade) * stepsPerSecond);
		frontBurns.apply(frontImage, time);
	}

	if (backBurns){
		var time = (animationIndex + secondsPerImage * stepsPerSecond) / ((secondsPerImage + secondsPerFade) * stepsPerSecond);
		if (time > 1)
			backBurns = 0;
		else
			backBurns.apply(backImage, time);
	}

	++timeIndex;

    setTime = setTimeout(step, 40);
}

function createImage(container)
{
	var image = document.createElement("img");
	image.className = "burnsImage";
	container.appendChild(image);
	return image;
}

function step()
{
	var animationIndex = timeIndex % (secondsPerImage * stepsPerSecond);

	if (animationIndex == 0)
	{
		// Clear the background.
		backDiv.innerHTML = "";

		// Put the previous image in the background.
		var swapDiv = backDiv;
		backImage = frontImage;
		backDiv = frontDiv;
		backBurns = frontBurns;
		frontDiv = swapDiv;

		// Put the new image in the foreground.
		frontImage = createImage(frontDiv);
		frontImage.onload = function()
		{
			// Scale the new image to fill the screen.
			//var windowWidth = frontDiv.offsetWidth;
			//var windowHeight = frontDiv.offsetHeight;
			//var imageWidth = frontImage.width;
			//var imageHeight = frontImage.height;

			//frontBurns = makeBurns(windowWidth, windowHeight, imageWidth/imageHeight);

			stepTail(animationIndex);
		}
		var currentImage = Math.floor(timeIndex / (secondsPerImage * stepsPerSecond)) % imageList.length;
        frontImage.src = imageList[currentImage];
	}
	else
	{
		if (animationIndex <= (secondsPerFade * stepsPerSecond))
		{
			var fade = animationIndex / (secondsPerFade * stepsPerSecond);
			setOpacity(frontImage, fade);
			if (backImage)
				setOpacity(backImage, 1-fade);
		}

		stepTail(animationIndex);
	}
}

function randomizeList(list)
{
	for (i = list.length-1; i > 0; --i)
	{
		// Swap each element with a random one earlier in the list.
		var j = Math.floor(Math.random() * (i+1));
		var swap = list[i];
		list[i] = list[j];
		list[j] = swap;
	}
}

function startSlideshow(images, backDivName, frontDivName)
{
	imageList = images;

	backDiv = document.getElementById(backDivName);
    frontDiv = document.getElementById(frontDivName);
    content = document.getElementById('content');
    
	//step();
}

function showScreenSaver(){
    content.style.display = "none";
    backDiv.style.display = "block";
    frontDiv.style.display = "block";
    screensaver_active = true;
    step();
}

function stopScreenSaver(){
    backDiv.style.display = "none";
    frontDiv.style.display = "none";
    content.style.display = "block"
    screensaver_active = false;
}

function ScreenSaver(){
    clearTimeout(mousetimeout);
    clearTimeout(setTime);
    clearTimeout(ScreenSaver);
    if(screensaver_active){
        stopScreenSaver();
    }

    mousetimeout = setTimeout(function(){
        showScreenSaver();
    }, 1000 * idletime);
}

document.addEventListener('mousemove', ScreenSaver);
document.addEventListener("keypress", ScreenSaver);



