import React, { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { airportData } from "./model/airportData";
import { flightData } from "./model/flightData";
import { seatData } from "./model/seatData";
import { format, parse } from "date-fns";
import { Weight } from "lucide-react";

// Utility function to calculate duration
const calculateDuration = (departureTime, arrivalTime) => {
  const dep = new Date(`1970-01-01T${departureTime}:00Z`);
  const arr = new Date(`1970-01-01T${arrivalTime}:00Z`);
  if (arr < dep) {
    arr.setDate(arr.getDate() + 1); // Crosses midnight
  }
  const duration = new Date(arr - dep);
  return `${duration.getUTCHours()}h ${duration.getUTCMinutes()}m`;
};

const FlightSearch = ({
  onSearchResults = () => {},
  buttonText = "Search",
  backgroundColor = "#f0f0f0",
  // highlightsContainer= "display:visible",
  buttonBackgroundColor = "auto",
  buttonTextColor = "auto",
  height = "auto",
  leavingLabel = "Leaving From",
  goingLabel = "Going To",
  dateLabel = "Journey Date",
  dropdownHindden = "auto",
  radioHindden = "auto",
  ReturnLable = "auto",
  hindenswap = "auto",
}) => {
  const [tripType, setTripType] = useState("one-way"); // State for radio buttons
  const [travellers, setTravellers] = useState(1); // State for number of travellers
  const [travelClass, setTravelClass] = useState("Economy"); // State for travel class

  const [returnDate, setReturnDate] = useState(null);

  const handleReturnDateChange = (date) => {
    setReturnDate(date);
  };

  const findAirportByName = (name) => {
    return airportData.find((airport) => airport.name === name);
  };

  const [fromAirport, setFromAirport] = useState(() => {
    const storedFromAirport = sessionStorage.getItem("fromAirport");
    return storedFromAirport
      ? {
          value: findAirportByName(storedFromAirport)?.id,
          label: storedFromAirport,
        }
      : null;
  });
  const [showJourneyCalendar, setShowJourneyCalendar] = useState(false);
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);

  const [toAirport, setToAirport] = useState(() => {
    const storedToAirport = sessionStorage.getItem("toAirport");
    return storedToAirport
      ? {
          value: findAirportByName(storedToAirport)?.id,
          label: storedToAirport,
        }
      : null;
  });

  const [journeyDate, setJourneyDate] = useState(() => {
    const storedDate = sessionStorage.getItem("journeyDate");
    return storedDate ? parse(storedDate, "dd/MM/yyyy", new Date()) : null;
  });

  useEffect(() => {
    if (fromAirport) sessionStorage.setItem("fromAirport", fromAirport.label);
    if (toAirport) sessionStorage.setItem("toAirport", toAirport.label);
    if (journeyDate)
      sessionStorage.setItem("journeyDate", format(journeyDate, "dd/MM/yyyy"));
  }, [fromAirport, toAirport, journeyDate]);

  const handleFromAirportChange = (selectedOption) =>
    setFromAirport(selectedOption);
  const handleToAirportChange = (selectedOption) =>
    setToAirport(selectedOption);
  const handleJourneyDateChange = (date) => setJourneyDate(date);

  const handleSwapLocations = () => {
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
  };

  const handleSearch = () => {
    if (!fromAirport || !toAirport || !journeyDate) {
      alert("Please select both airports and journey date.");
      return;
    }
    const results = findFlightsBetweenAirports(
      fromAirport.value,
      toAirport.value,
      journeyDate
    );
    onSearchResults(results);
  };

  const handleTravellersChange = (event) => setTravellers(event.target.value);
  const handleTravelClassChange = (event) => setTravelClass(event.target.value);

  const findFlightsBetweenAirports = (fromAirportId, toAirportId, date) => {
    const fromAirportName = airportData.find(
      (airport) => airport.id === fromAirportId
    )?.name;
    const toAirportName = airportData.find(
      (airport) => airport.id === toAirportId
    )?.name;

    const filteredFlights = flightData.filter((flight) => {
      return (
        flight.stops.some((stop) => stop.airportId === fromAirportId) &&
        flight.stops.some((stop) => stop.airportId === toAirportId)
      );
    });

    const resultsWithEconomyPrice = filteredFlights.map((flight) => {
      const seatInfo = seatData.find(
        (seat) => seat.flightId === flight.flightId
      );
      const economyPrice =
        seatInfo?.classes.find((cls) => cls.classType === "Economy")?.price ||
        "Not Available";
      const formattedStops = flight.stops.map((stop) => ({
        ...stop,
        airport:
          airportData.find((airport) => airport.id === stop.airportId)?.name ||
          "Unknown",
      }));
      const duration = calculateDuration(
        flight.departureTime,
        flight.arrivalTime
      );

      return {
        ...flight,
        fromAirport: fromAirportName,
        toAirport: toAirportName,
        economyPrice: `₹${economyPrice}`,
        stops: formattedStops,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: duration,
      };
    });

    return resultsWithEconomyPrice;
  };

  const airportOptions = airportData.map((airport) => ({
    value: airport.id,
    label: airport.name,
  }));
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      border: "none",
      borderRadius: "4px",
      padding: "8px",
      backgroundColor: "transparent",
      width: "100%",
      boxShadow: "none",
      "&:hover": {
        border: "none",
       
      },
      
    }),
    menu: (provided) => ({ 
      ...provided, 
      borderRadius: "12px",
      width: "100%",
      marginTop:'10px',
      backgroundColor: 'white',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }),
    menuList: (provided) => ({
      ...provided,
      fontWeight: 500,
      padding:'16px 0px',

      
      
    
    }),
    placeholder: (provided) => ({ ...provided, color: "#999" }),
    singleValue: (provided) => ({ ...provided, color: "#333" }),
    container: (provided) => ({
      ...provided,
      width: "100%",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: 'white',
      color: state.isSelected ? 'white' : '#333',
      backgroundColor: state.isSelected ? '#d20000' : 'white',
      '&:hover': {
        backgroundColor: '#e5e8e8',
        color:'#17181c',
        cursor: 'pointer'
      },
      fontWeight: 500,
      fontSize: '14px',
      padding: '8px 12px',
    }),
    singleValue: (provided) => ({ 
      ...provided, 
      color: "#333",
     
    }),
    placeholder: (provided) => ({ 
      ...provided, 
      color: "#999",
      
    }),
    
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        !e.target.closest(".calendar-popup") &&
        !e.target.closest(".form-control")
      ) {
        setShowReturnCalendar(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <>
      <style>
        {`
         .search-component {
            background-color: ${backgroundColor};
            height: 200px;
            padding: 15px;
            background-size: cover;
            background-position: center;
          }

          @media (max-width: 768px) {
            .search-component {
              height: 330px;
              padding: 15px;
            }
              .swap-icon-container {
              top: 52%; 
              left: calc(34% - 15px);  
            }
          }

          @media (max-width: 576px) {
            .search-component {
              height: 450px;
              padding: 10px;
            }
          }
             .swap-icon-container {
            display: ${hindenswap};
            position: absolute; 
            top: 46%; 
            left: calc(32% - 15px); 
            z-index: 1; 
            width:max-content;
            font-weight:
          }

          .form-control {
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border: none;
            padding: 12px;
            border-radius: 4px;
          }

          .btn.full-width {
            width: 100%;
            font-weight: 500;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border: none;
            
          }
            .btn.full-width:hover {
    background-color: #cd2c22 !important;
}
          .radiobutton{
            display:  ${radioHindden}; 
            align-items: center;
            accent-color: #cd2c22;
          }
          .dropdown-container  {
            display:  ${dropdownHindden}; 
            align-items: center;
          }
            .calendar-popup {
              position: absolute;
              z-index: 1000;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              padding: 10px;
              background-color: white;
              transform: translate(-100px, 365px);
            }

            .form-control {
              width: 100%;
              max-width: 100%; /* Keeps width responsive without affecting other elements */
              padding: 34px 0px;
              padding-left:20px;
              background:white;
              box-shadow:none;
              border-radius:12px;
              border:1px solid #e0e0e0;
              font-size:16px;


              
            }
              .search-wrap .form-control{
              height:50px;
              }
              .react-calendar__tile--active {
              background: #d20000;
              color: white;
            }
               .react-calendar__tile {
              border-radius: 8px; /* Makes each tile rounded */
              padding: 10px; /* Adds padding to tiles */
              margin: 4px; /* Spacing between tiles */
            }
          .form-control:focus {
            background: transparent;
            outline: none !important;
            box-shadow: none !important;
            border-color: #e0e0e0 !important;
          }


            .new-wrap{
              background:#f4f5f5;
               padding: 14px;
              border-radius: 12px;
              box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.1);
              
              }
              .react-calendar {
              bottom:88%;
    width: 350px;
  max-width:280%;
    background: white;
    border: 1px solid #a0a096;
    font-family: 'Arial', 'Helvetica', sans-serif;
    line-height: 1.125em;
    
}
    .calendar-popup { 

}


.css-1wy0on6{
display: none;
}

.search-wrap .btn{
height:60px;
}
.airport_input{
font-weight:bold;
width: 100%;
}

.swap-button{
color:gray;
}

.react-calendar__tile--now {
    background: #ffe8e8;
}

.form-control:disabled {
    background-color: transparent;
    opacity: 1;
}

.css-1s2u09g-control {
  width: 100% !important;
}

.css-1s2u09g-control:focus {
  border: none !important;
  box-shadow: none !important;
}

@media (min-width: 992px) {
  .col-lg-3 {
    flex: 0 0 auto;
    width: 28%;
  }
  
  .col-lg-2 {
    flex: 0 0 auto;
    width: 18%;
  }
  
  .col-lg-1 {
    flex: 0 0 auto;
    width: 10%;
  }
}

.form-group {
  width: 100%;
}

.airport_input {
  width: 100% !important;
}

.btn-danger:hover {
  background-color: #cd2c22 !important;
  border-color: #cd2c22 !important;
}
  
        `}
      </style>

      <div className="search-component">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
              <div className="search-wrap position-relative">
                <div className="row align-items-end gy-3 gx-md-1 gx-sm-1">
                  {/* Radio Buttons for One Way and Round Trip */}
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="d-flex justify-content-between">
                      <div className="radiobutton">
                        <label>
                          <input
                            type="radio"
                            value="one-way"
                            checked={tripType === "one-way"}
                            onChange={() => setTripType("one-way")}
                          />{" "}
                          One Way
                        </label>
                        &nbsp;&nbsp;
                        <label>
                          <input
                            type="radio"
                            value="round-trip"
                            checked={tripType === "round-trip"}
                            onChange={() => setTripType("round-trip")}
                          />{" "}
                          Round Trip
                        </label>
                      </div>
                      <div className="dropdown-container">
                        <select
                          value={travellers}
                          onChange={handleTravellersChange}
                          className="form-select"
                        >
                          <option value={1}>Adults(12Y+)</option>
                          <option value={2}>Children(2Y-12Y)</option>
                          <option value={3}>Infants(below 2y)</option>
                          {/* Add more options as needed */}
                        </select>
                        &nbsp;&nbsp;
                        <select
                          value={travelClass}
                          onChange={handleTravelClassChange}
                          className="form-select"
                        >
                          <option value="Economy">Economy</option>
                          <option value="Business">Business</option>
                          <option value="First">First Class</option>
                        </select>
                      </div>
                    </div>
                  </div>

                

                  {/* Select Fields */}
                  <div className="position-relative new-wrap">
                    <div className="row g-2 align-items-center">
                      {/* From Airport */}
                      <div className="col-lg-3 col-md-6 col-12">
                        <div className="form-group form-control mb-0 d-flex align-items-center position-relative">
                       
                          <i className="fa-solid fa-plane-departure position-absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 100 }}></i>
                          {/* {leavingLabel && (
                            <label className="text-light text-uppercase opacity-75">
                              {leavingLabel}
                            </label>
                          )} */}
                          <Select
                            value={fromAirport}
                            onChange={handleFromAirportChange}
                            options={airportOptions}
                            styles={customSelectStyles}
                            placeholder="From"
                            className="airport_input"
                          />
                        </div>
                      </div>

                      {/* Swap Button */}
                      <div className="col-auto d-none d-md-block">
                        <button
                          type="button"
                          className="btn swap-button"
                          onClick={handleSwapLocations}
                          style={{ padding: '10px' }}
                        >
                          <i className="fa-solid fa-arrow-right-arrow-left text-black"></i>
                        </button>
                      </div>

                      {/* To Airport */}
                      <div className="col-lg-3 col-md-6 col-12">
                        <div className="form-group form-control  mb-0 d-flex align-items-center position-relative">
                          <i className="fa-solid fa-plane-arrival position-absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 100 }}></i>
                          {goingLabel && (
                            <label className="text-light text-uppercase opacity-75">
                              {goingLabel}
                            </label>
                          )}
                          <Select
                            value={toAirport}
                            onChange={handleToAirportChange}
                            options={airportOptions}
                            styles={customSelectStyles}
                            placeholder="To"
                            className="airport_input"
                          />
                        </div>
                      </div>

                      {/* Journey Date */}
                      <div className="col-lg-2 col-md-6 col-12" style={{width:'14%'}}>
                        <div className="form-group  mb-0 position-relative">
                          <i className="fa-regular fa-calendar position-absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}></i>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Journey Date"
                            value={journeyDate ? format(journeyDate, "dd/MM/yyyy") : ""}
                            readOnly
                            onClick={() => setShowJourneyCalendar(!showJourneyCalendar)}
                            style={{paddingLeft:"30px"}}
                          />
                          {showJourneyCalendar && (
                            <Calendar
                              onChange={(date) => {
                                handleJourneyDateChange(date);
                                setShowJourneyCalendar(false);
                              }}
                              value={journeyDate}
                              className="calendar-popup"
                            />
                          )}
                        </div>
                      </div>

                      {/* Return Date */}
                      <div className="col-lg-1 col-md-6 col-12" style={{width:'16%'}}>
                        <div className="form-group mb-0 position-relative">
                          <i className="fa-regular fa-calendar position-absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}></i>
                          <input
                            type="text"
                            className={`form-control ${tripType === "one-way" ? "disabled-input" : ""}`}
                            placeholder="Return Date"
                            value={returnDate ? format(returnDate, "dd/MM/yyyy") : ""}
                            readOnly
                            onClick={(e) => {
                              e.stopPropagation();
                              if (tripType === "one-way") {
                                setTripType("round-trip");
                              }
                              setShowReturnCalendar((prevState) => !prevState);
                            }}
                            style={{paddingLeft:"30px"}}
                          />
                          {returnDate && (
                            <i 
                              className="fa-solid fa-times position-absolute" 
                              style={{ 
                                right: '10px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                cursor: 'pointer',
                                fontSize:'18px',
                                zIndex: 1 
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setReturnDate(null);
                                setTripType("one-way");
                              }}
                            />
                          )}
                          {showReturnCalendar && (
                            <Calendar
                              onChange={(date) => {
                                handleReturnDateChange(date);
                                setShowReturnCalendar(false);
                              }}
                              value={returnDate}
                              className="calendar-popup"
                            />
                          )}
                        </div>
                      </div>

                      {/* Search Button */}
                      <div className="col-lg-1 col-12">
                        <button
                          className="btn btn-danger form-center   w-100"
                          onClick={handleSearch}
                          style={{
                            backgroundColor: buttonBackgroundColor,
                            color: buttonTextColor,
                            height: '100%',
                            height:'62px',
                            borderRadius:'12px',
                          
                          }}
                        >
                           <i className="fa-solid fa-magnifying-glass me-2" />
                          {buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlightSearch;
